export declare const tempDir: string;
export declare const supportedPlatforms: readonly ["darwin", "win32"];
export declare const platform: "darwin" | "win32";
export declare const platformConfig: {
    requiredFiles: RegExp[];
    feedUrl: string;
} | {
    requiredFiles: RegExp[];
    feedUrl: string;
};
export declare const channelName = "ElectronAutoUpdater";
export declare const appName: string;
export declare const appVersion: string;
export declare const releaseIdCachePath: string;
export declare const eventTypes: readonly ["error", "checking-for-update", "update-available", "update-not-available", "update-downloading", "update-downloaded", "before-quit-for-update"];
