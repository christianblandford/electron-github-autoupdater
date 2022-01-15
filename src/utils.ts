import os from 'os'
import fs from 'fs'
import path from 'path'
import axios, { AxiosError } from 'axios'
import { app, BrowserWindow } from 'electron'
import semver from 'semver'
import {
  channelName,
  supportedPlatforms,
  tempDir,
  platform,
  platformConfig,
  releaseIdCachePath,
} from './constants'
import {
  AutoUpdateDownloadProgress,
  AutoUpdateRepoConfig,
  GithubRelease,
  GithubReleaseAsset,
} from './types'

export type ValidatedPlatform = typeof supportedPlatforms[number]

export const getTempDir = () => {
  const tempDirPath = path.join(app.getPath('temp'), app.getName())
  // Create the temp dir
  if (!fs.existsSync(tempDirPath)) fs.mkdirSync(tempDirPath)
  return tempDirPath
}

// Returns platform name, or throws exception if on unsupported platform
export const validatePlatform = () => {
  const platform = os.platform()
  if (!supportedPlatforms.includes(platform as ValidatedPlatform))
    throw new Error(`Platform ${os.platform()} is not yet supported`)

  return platform as ValidatedPlatform
}

// Returns the updater config for the current platform
export const getPlatformConfig = (platform: ValidatedPlatform) => {
  return {
    win32: { requiredFiles: [/[^ ]*-full\.nupkg/gim, /RELEASES/], feedUrl: tempDir },
    darwin: {
      requiredFiles: [/[^ ]*\.zip/gim, /feed.json/],
      feedUrl: path.join(tempDir, 'feed.json'),
    },
  }[platform]
}

export const generateHeaders = (accessToken: string) => {
  return { Authorization: `token ${accessToken}` }
}

// Determines required update files based on platform
export const findRequiredReleaseAssets = (assets: GithubReleaseAsset[]): GithubReleaseAsset[] => {
  return platformConfig.requiredFiles.map((filePattern) => {
    const match = assets.find((asset) => asset.name.match(filePattern))
    if (!match)
      throw new Error(
        `Release is missing a required update file for current platform (${platform})`
      )
    else return match
  })
}

export const getCachedReleaseId = () => {
  if (fs.existsSync(releaseIdCachePath)) {
    return parseInt(fs.readFileSync(releaseIdCachePath, { encoding: 'utf-8' }))
  } else {
    return null
  }
}
