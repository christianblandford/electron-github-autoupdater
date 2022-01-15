"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventTypes = exports.releaseIdCachePath = exports.appVersion = exports.appName = exports.channelName = exports.platformConfig = exports.platform = exports.supportedPlatforms = exports.tempDir = void 0;
var path_1 = __importDefault(require("path"));
var electron_1 = require("electron");
var utils_1 = require("./utils");
exports.tempDir = (0, utils_1.getTempDir)();
exports.supportedPlatforms = ['darwin', 'win32'];
exports.platform = (0, utils_1.validatePlatform)();
exports.platformConfig = (0, utils_1.getPlatformConfig)(exports.platform);
exports.channelName = 'ElectronAutoUpdater';
exports.appName = electron_1.app.getVersion();
exports.appVersion = electron_1.app.getVersion();
exports.releaseIdCachePath = path_1.default.join(exports.tempDir, '.cache');
exports.eventTypes = [
    'error',
    'checking-for-update',
    'update-available',
    'update-not-available',
    'update-downloading',
    'update-downloaded',
    'before-quit-for-update',
];
