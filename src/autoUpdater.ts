import axios, { AxiosError } from 'axios'
import { app, autoUpdater as electronAutoUpdater, BrowserWindow, ipcMain } from 'electron'
import isDev from 'electron-is-dev'
import fs from 'fs'
import path from 'path'
import EventEmitter from 'events'
import { eq as semverEq, gt as semverGt, gte as semverGte } from 'semver'
import { channelName, tempDir, eventTypes, releaseIdCachePath, platformConfig } from './constants'
import { findRequiredReleaseAssets, generateHeaders, getCachedReleaseId, getTempDir } from './utils'
import { GithubRelease, ElectronGithubAutoUpdaterEvent } from './types'

export type ElectronGithubAutoUpdaterOptions = {
  baseUrl?: string
  owner: string
  repo: string
  accessToken: string
  allowPrerelease?: boolean
  forwardEvents?: boolean
}

class ElectronGithubAutoUpdater extends EventEmitter {
  baseUrl: string
  owner: string
  repo: string
  accessToken: string
  autoUpdater: typeof electronAutoUpdater
  allowPrerelease: boolean
  forwardEvents: boolean

  constructor({
    baseUrl = 'https://api.github.com',
    owner,
    repo,
    accessToken,
    allowPrerelease = false,
    forwardEvents = true,
  }: ElectronGithubAutoUpdaterOptions) {
    super()

    this.baseUrl = baseUrl
    this.owner = owner
    this.repo = repo
    this.accessToken = accessToken

    this.autoUpdater = electronAutoUpdater
    this.allowPrerelease = allowPrerelease
    this.forwardEvents = forwardEvents

    // Register IPC listeners
    this._registerIpcListeners()

    // Setup a listener for certain events emitted from electron's default autoUpdater, as that is still used
    // by this package to install updates, and we want the events forwarded properly
    this.autoUpdater.addListener('before-quit-for-update', this.emit)
  }

  // Adds listeners for IPC Events
  _registerIpcListeners = () => {
    ipcMain.handle(`${channelName}.checkForUpdates`, (event) => {
      this.checkForUpdates()
      return true
    })
    ipcMain.handle(`${channelName}.quitAndInstall`, (event) => {
      this.quitAndInstall()
      return true
    })

    ipcMain.handle(`${channelName}.clearCache`, (event) => {
      this.clearCache()
      return true
    })
  }

  /**************************************************************************************************
   *     EventEmitter Overrides
   **************************************************************************************************/

  emit = (event: ElectronGithubAutoUpdaterEvent, args?: any) => {
    if (!eventTypes.includes(event))
      throw new Error(`${event} is not an event that can be emitted by this class`)

    if (this.forwardEvents) {
      BrowserWindow.getAllWindows().map((window) => {
        window.webContents.send(channelName, { eventName: event, eventDetails: args })
      })
    }

    if (!args) {
      return super.emit(event)
    } else if (Array.isArray(args)) {
      return super.emit(event, ...args)
    } else {
      return super.emit(event, args)
    }
  }

  on = (event: ElectronGithubAutoUpdaterEvent, listener: (...args: any[]) => void) => {
    if (typeof listener !== 'function') throw new Error('Listener must be a function')
    if (!eventTypes.includes(event))
      throw new Error(`${event} is not an event emitted by this class`)

    super.on(event, listener)
    return this
  }

  once = (event: ElectronGithubAutoUpdaterEvent, listener: (...args: any[]) => void) => {
    if (typeof listener !== 'function') throw new Error('Listener must be a function')
    if (!eventTypes.includes(event))
      throw new Error(`${event} is not an event emitted by this class`)

    return super.once(event, listener)
  }

  // Destroys all related IpcMain listeners
  destroy = () => {
    ipcMain.removeAllListeners(`${channelName}.checkForUpdates`)
    ipcMain.removeAllListeners(`${channelName}.quitAndInstall`)
    ipcMain.removeAllListeners(`${channelName}.clearCache`)
  }

  /**************************************************************************************************
   *     Internal Methods
   **************************************************************************************************/
  _emitError = (error: any) => {
    this.emit('error', error)
    throw error
  }

  _getLatestRelease = async () => {
    if (!this.allowPrerelease) {
      const response = await axios.get(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/releases?per_page=100`,
        {
          headers: generateHeaders(this.accessToken),
        }
      )
      const releases = response.data

      const filtered = releases.filter((release: GithubRelease) => !release.prerelease)
      if (filtered.length === 0) {
        throw new Error('No production releases found')
      } else {
        return filtered[0]
      }
    } else {
      const response = await axios.get(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/releases/latest`,
        {
          headers: generateHeaders(this.accessToken),
        }
      )
      return response.data
    }
  }

  // Downloads all required update files for the current platform
  _downloadUpdateFiles = async (release: GithubRelease) => {
    const assets = findRequiredReleaseAssets(release.assets)

    // Set variables to track download progress, including calculating the total download size
    const totalSize = assets.reduce((prev, asset) => (prev += asset.size), 0)
    let downloaded = 0

    // Download the files

    for await (const file of assets) {
      const outputPath = path.join(tempDir, file.name)
      const assetDownloadUrl = `${this.baseUrl}/repos/${this.owner}/${this.repo}/releases/assets/${file.id}`

      await this._downloadUpdateFile(assetDownloadUrl, outputPath, (event) => {
        downloaded += event.loaded

        this.emit('update-downloading', {
          size: totalSize,
          progress: downloaded,
          percent: Math.round((downloaded * 100) / totalSize),
        })
      })
    }
    // Write a cache file containing the release ID
    fs.writeFileSync(releaseIdCachePath, release.id.toString(), { encoding: 'utf-8' })
    console.log('Done downloading update files')
  }

  // Downloads a single file
  _downloadUpdateFile = async (
    assetUrl: string,
    outputPath: string,
    onProgressEvent: (progressEvent: any) => void
  ) => {
    return new Promise(async (resolve, reject) => {
      const { data } = await axios.get(assetUrl, {
        headers: {
          ...generateHeaders(this.accessToken),
          Accept: 'application/octet-stream',
        },
        responseType: 'stream',
      })

      const writer = fs.createWriteStream(outputPath)

      // Emit a progress event when a chunk is downloaded
      data.on('data', (chunk: Buffer) => {
        onProgressEvent({ loaded: chunk.length })
      })

      // Pipe data into a writer to save it to the disk rather than keeping it in memory
      data.pipe(writer)

      return data.on('end', () => {
        return resolve(true)
      })
    })
  }

  // Preps the default electron autoUpdater to install the update
  _loadElectronAutoUpdater = (release: GithubRelease) => {
    this.emit('update-downloaded', {
      releaseName: release.name,
      releaseNotes: release.body || '',
      releaseDate: new Date(release.published_at),
      updateUrl: release.html_url,
    })
    if (!isDev) {
      this.autoUpdater.setFeedURL({ url: platformConfig.feedUrl })
    }
  }

  // Uses electron autoUpdater to install the downloaded update
  _installDownloadedUpdate = () => {
    if (!isDev) {
      this.autoUpdater.checkForUpdates()
    } else {
      console.error('Cannot install an update while running in dev mode.')
    }
  }

  /**************************************************************************************************
   *     autoUpdater Overrides
   **************************************************************************************************/

  checkForUpdates = async () => {
    try {
      this.emit('checking-for-update')

      // Find the latest release
      const latestRelease = await this._getLatestRelease()
      const latestReleaseVersion = latestRelease.tag_name
      const releaseId = latestRelease.id
      const currentVersion = app.getVersion()
      const cachedReleaseId = getCachedReleaseId()

      // If the current app version is greater than or equal to the latest release, there is no update available
      if (semverGte(currentVersion, latestReleaseVersion)) {
        this.emit('update-not-available')
      }
      // If the latest release is a higher version than the installed version
      else if (semverGt(latestReleaseVersion, currentVersion)) {
        this.emit('update-available')

        // If there is a cached update and the ID is the same as the latest release ID
        // then we have already downloaded the latest update.
        if (cachedReleaseId !== releaseId) {
          await this._downloadUpdateFiles(latestRelease)
        }
        // Load the built in electron auto updater with the files we generated
        this._loadElectronAutoUpdater(latestRelease)
        // Use the built in electron auto updater to install the update
        this._installDownloadedUpdate()
      } else {
        // If we get here, there is a bug in the above logic.
        console.log({
          currentVersion: currentVersion,
          latestReleaseVersion: latestReleaseVersion,
          latestRelease: latestRelease,
          releaseId: releaseId,
          cachedReleaseId: cachedReleaseId,
        })
        throw new Error(
          'Error in cache and release semver comparison. This is not a bug in your code, this is a problem with the library.'
        )
      }
    } catch (e) {
      this._emitError(e)
    }
  }

  quitAndInstall = () => {
    try {
      this.autoUpdater.quitAndInstall()
    } catch (e) {
      this._emitError(e)
    }
  }

  clearCache = () => {
    console.log('Clearing autoUpdater cache...')
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
      if (fs.existsSync(tempDir)) throw new Error('Failed to clear temp directory')
      getTempDir()
      console.log('Done clearing autoUpdater cache')
      this.emit('update-not-available')
    } catch (e) {
      this._emitError(e)
    }
  }
}

// Export function that returns new instance of the updater, to closer match electron's autoUpdater API
export const autoUpdater = (config: ElectronGithubAutoUpdaterOptions) => {
  return new ElectronGithubAutoUpdater(config)
}
