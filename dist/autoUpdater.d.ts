/// <reference types="node" />
import { autoUpdater as electronAutoUpdater } from 'electron';
import EventEmitter from 'events';
import { GithubRelease, ElectronGithubAutoUpdaterEvent } from './types';
export declare type ElectronGithubAutoUpdaterOptions = {
    baseUrl?: string;
    owner: string;
    repo: string;
    accessToken: string;
    allowPrerelease?: boolean;
    forwardEvents?: boolean;
};
declare class ElectronGithubAutoUpdater extends EventEmitter {
    baseUrl: string;
    owner: string;
    repo: string;
    accessToken: string;
    autoUpdater: typeof electronAutoUpdater;
    allowPrerelease: boolean;
    forwardEvents: boolean;
    constructor({ baseUrl, owner, repo, accessToken, allowPrerelease, forwardEvents, }: ElectronGithubAutoUpdaterOptions);
    _registerIpcListeners: () => void;
    /**************************************************************************************************
     *     EventEmitter Overrides
     **************************************************************************************************/
    emit: (event: ElectronGithubAutoUpdaterEvent, args?: any) => boolean;
    on: (event: ElectronGithubAutoUpdaterEvent, listener: (...args: any[]) => void) => this;
    once: (event: ElectronGithubAutoUpdaterEvent, listener: (...args: any[]) => void) => this;
    destroy: () => void;
    /**************************************************************************************************
     *     Internal Methods
     **************************************************************************************************/
    _emitError: (error: any) => never;
    _getLatestRelease: () => Promise<any>;
    _downloadUpdateFiles: (release: GithubRelease) => Promise<void>;
    _downloadUpdateFile: (assetUrl: string, outputPath: string, onProgressEvent: (progressEvent: any) => void) => Promise<unknown>;
    _loadElectronAutoUpdater: (release: GithubRelease) => void;
    _installDownloadedUpdate: () => void;
    /**************************************************************************************************
     *     autoUpdater Overrides
     **************************************************************************************************/
    checkForUpdates: () => Promise<void>;
    quitAndInstall: () => void;
    clearCache: () => void;
}
export declare const autoUpdater: (config: ElectronGithubAutoUpdaterOptions) => ElectronGithubAutoUpdater;
export {};
