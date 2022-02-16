# electron-github-autoupdater

**Using this package with React?** Check out this project's companion package, [react-electron-autoupdater](https://github.com/christianblandford/react-electron-autoupdater), which provides a custom hook for easily handling updates in the renderer process!

Are you using electron with maker-squirrel? Do you need to use a private or enterprise Github repo for deployment? Then this package is for you! Who wants to go through all the work of standing up an electron release server just to deploy and auto update an electron app. Isn't electron supposed to be easy? This package makes it that way.

This package is intended to be as close as possible to electron's built-in autoUpdater, while allowing for private or enterprise github repositories as the update "feed".

All you need to do is provide your Github base url, your organization or owner name, and your repo name. That's it!

**Note:** Currently, only osx/macos and windows are supported.

## Installation and Usage

`yarn add electron-github-autoupdater`

Import the library in your main process

    import { autoUpdater } from 'electron-github-autoupdater'

    autoUpdater({config})

That's pretty much it! It looks just like Electron's autoUpdater, but accepts a config object.

## Config

    {
        baseUrl: string, //optional, default: 'https://api.github.com'
        owner: string,
        repo: string,
        accessToken: string,
        allowPrerelease?: boolean, //optional, default: false
        forwardEvents?: boolean, //optional, default: true
    }

- **baseUrl**: Optional, default: `'https://api.github.com'`. The base URL for your github enterprise environment. Example: `https://github.company.com/api/v3`
- **owner**: Required. Owner name or organization name
- **repo**: Required. Repo name
- **accessToken** Required. Github personal access token with access to your repo
- **allowPrerelease** Optional. Default false. Specify if you want to allow auto updating to releases tagged as prerelease
- **forwardEvents** Optional. Default true. Specify if you want to automatically forward events to all renderer windows. Should only be disabled for performance reasons, or if manually handling events in the main process.

### Config Example

    const updater = autoUpdater({
        baseUrl: 'https://github.company.com/api/v3',
        owner: 'christianblandford',
        repo: 'my-electron-app',
        accessToken: '231e205d64ea7ac16c35839f63f891fc9a29f62c1'
    })

# Events

autoUpdater object emits the following events:

## Event: 'error'

Returns:

- `error` Error

Emitted when there is an error while updating.

## Event: 'checking-for-update'

Emitted when checking if an update has started.

## Event: 'update-available'

Emitted when there is an available update. The update is downloaded automatically.

Returns:

- `event` Event
- `releaseNotes` String?: Returned if release description is provided in Github.
- `releaseName` String
- `releaseDate` Date
- `updateURL` String: URL to view release in Github (html_url)

## Event: 'update-not-available'

Emitted when there is no available update.

## Event: 'update-downloading'

Returns:

- `event` Event
- `size` Number: Total size of all files that are being downloaded
- `progress` Number: Total bytes downloaded
- `percent` Number: Percent complete
- `releaseNotes` String?: Returned if release description is provided in Github.
- `releaseName` String
- `releaseDate` Date
- `updateURL` String: URL to view release in Github (html_url)

Emitted when an update is downloading.

**Note:** This is the only event that differs from Electron's autoUpdater API. Make sure to handle this, as this event will fire immediately after `update-available`

## Event: 'update-downloaded'

Returns:

- `event` Event
- `releaseNotes` String?: Returned if release description is provided in Github.
- `releaseName` String
- `releaseDate` Date
- `updateURL` String: URL to view release in Github (html_url)

Emitted when an update has been downloaded. These values are available on all supported platforms, unlike Electron's default autoUpdater.

**Note:** It is not strictly necessary to handle this event. A successfully downloaded update will still be applied the next time the application starts.

## Event: 'before-quit-for-update'

Emitted when there is no available update.

This event is emitted after a user calls `quitAndInstall()`.

# Methods

All methods are class methods so use them like this:
` const updater = autoUpdater({ ... }) updater.checkForUpdates()`

## async checkForUpdates()

Checks Github for an update. If one is found, it will automatically be downloaded and installed. FeedUrl is set automatically by this package.

## async getLatestRelease()

Async function that returns the latest release from Github, regardless of if it is newer than the current app version or not. [More information here](https://docs.github.com/en/rest/reference/releases#list-releases).

## async downloadUpdateFromRelease(release: GithubRelease)

If you want to provide releases manually, this method will install any given release you pass it. Just like checkForUpdates(), except it will not automatically find the latest update. **Note:** implement your own checks to see if the release is a higher version number, as this function will install any release regardless of version.

## quitAndInstall()

Restarts the app and installs the update after it has been downloaded. It should only be called after update-downloaded has been emitted.

Under the hood calling autoUpdater.quitAndInstall() will close all application windows first, and automatically call app.quit() after all windows have been closed.

## clearCache()

Clears the autoUpdate cache, should only be used in the event of a bug

## destory()

Removes all related IpcMain listeners. Should be used when re-initializing the autoUpdater object, if a setting changes or something similar.

# Using in Renderer

## IPC Events

If config.forwardEvents is enabled in the constructor, this package will automatically forward all of its events to the IPC channel: 'ElectronAutoUpdater', with an object containing the event name and any event details as the first argument

Example:

    ipcRenderer.on('ElectronAutoUpdater', (event: Electron.IpcRendererEvent, {eventName, eventDetails}: ElectronGithubAutoUpdaterIpcEvent) => {
        console.log(eventName, eventDetails)
    })

## IPC Methods

If you want to invoke this package's methods from the renderer, these IPC events expose them

### ipcRenderer.sendSync('ElectronAutoUpdater', 'getStatus')

Returns the last emitted event, which should be the most recent status.

### ipcRenderer.sendSync('ElectronAutoUpdater', 'getVersion')

Returns value from `app.getVersion()`, so that the renderer can know its current version.

### ipcRenderer.invoke('ElectronAutoUpdater', 'checkForUpdates')

Alias for `checkForUpdates()`. Does not return anything, but will emit events as it checks for updates and status changes.

### ipcRenderer.invoke('ElectronAutoUpdater', 'quitAndInstall')

Alias for `quitAndInstall()`

### ipcRenderer.invoke('ElectronAutoUpdater', 'clearCache')

Alias for `clearCache()`

### ipcRenderer.invoke('ElectronAutoUpdater', 'getLatestRelease')

Returns the latest release found in github
