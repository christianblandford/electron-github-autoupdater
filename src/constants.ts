import path from 'path'
import { app } from 'electron'

import { getPlatformConfig, getTempDir, validatePlatform } from './utils'

export const tempDir = getTempDir()
export const supportedPlatforms = ['darwin', 'win32'] as const
export const platform = validatePlatform()
export const platformConfig = getPlatformConfig(platform)
export const channelName = 'ElectronAutoUpdater'
export const appName = app.getVersion()
export const appVersion = app.getVersion()
export const releaseIdCachePath = path.join(tempDir, '.cache')
export const eventTypes = [
  'error',
  'checking-for-update',
  'update-available',
  'update-not-available',
  'update-downloading',
  'update-downloaded',
  'before-quit-for-update',
] as const
