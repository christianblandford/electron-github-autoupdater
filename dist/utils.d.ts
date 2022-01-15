import { supportedPlatforms } from './constants';
import { GithubReleaseAsset } from './types';
export declare type ValidatedPlatform = typeof supportedPlatforms[number];
export declare const getTempDir: () => string;
export declare const validatePlatform: () => "darwin" | "win32";
export declare const getPlatformConfig: (platform: ValidatedPlatform) => {
    requiredFiles: RegExp[];
    feedUrl: string;
} | {
    requiredFiles: RegExp[];
    feedUrl: string;
};
export declare const generateHeaders: (accessToken: string) => {
    Authorization: string;
};
export declare const findRequiredReleaseAssets: (assets: GithubReleaseAsset[]) => GithubReleaseAsset[];
export declare const getCachedReleaseId: () => number | null;
