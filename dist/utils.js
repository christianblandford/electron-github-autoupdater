"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedReleaseId = exports.findRequiredReleaseAssets = exports.generateHeaders = exports.getPlatformConfig = exports.validatePlatform = exports.getTempDir = void 0;
var os_1 = __importDefault(require("os"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var electron_1 = require("electron");
var constants_1 = require("./constants");
var getTempDir = function () {
    var tempDirPath = path_1.default.join(electron_1.app.getPath('temp'), electron_1.app.getName());
    // Create the temp dir
    if (!fs_1.default.existsSync(tempDirPath))
        fs_1.default.mkdirSync(tempDirPath);
    return tempDirPath;
};
exports.getTempDir = getTempDir;
// Returns platform name, or throws exception if on unsupported platform
var validatePlatform = function () {
    var platform = os_1.default.platform();
    if (!constants_1.supportedPlatforms.includes(platform))
        throw new Error("Platform ".concat(os_1.default.platform(), " is not yet supported"));
    return platform;
};
exports.validatePlatform = validatePlatform;
// Returns the updater config for the current platform
var getPlatformConfig = function (platform) {
    return {
        win32: { requiredFiles: [/[^ ]*-full\.nupkg/gim, /RELEASES/], feedUrl: constants_1.tempDir },
        darwin: {
            requiredFiles: [/[^ ]*\.zip/gim, /feed.json/],
            feedUrl: path_1.default.join(constants_1.tempDir, 'feed.json'),
        },
    }[platform];
};
exports.getPlatformConfig = getPlatformConfig;
var generateHeaders = function (accessToken) {
    return { Authorization: "token ".concat(accessToken) };
};
exports.generateHeaders = generateHeaders;
// Determines required update files based on platform
var findRequiredReleaseAssets = function (assets) {
    return constants_1.platformConfig.requiredFiles.map(function (filePattern) {
        var match = assets.find(function (asset) { return asset.name.match(filePattern); });
        if (!match)
            throw new Error("Release is missing a required update file for current platform (".concat(constants_1.platform, ")"));
        else
            return match;
    });
};
exports.findRequiredReleaseAssets = findRequiredReleaseAssets;
var getCachedReleaseId = function () {
    if (fs_1.default.existsSync(constants_1.releaseIdCachePath)) {
        return parseInt(fs_1.default.readFileSync(constants_1.releaseIdCachePath, { encoding: 'utf-8' }));
    }
    else {
        return null;
    }
};
exports.getCachedReleaseId = getCachedReleaseId;
