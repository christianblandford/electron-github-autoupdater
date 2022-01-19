"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoUpdater = void 0;
var axios_1 = __importDefault(require("axios"));
var electron_1 = require("electron");
var electron_is_dev_1 = __importDefault(require("electron-is-dev"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var events_1 = __importDefault(require("events"));
var semver_1 = require("semver");
var constants_1 = require("./constants");
var utils_1 = require("./utils");
var ElectronGithubAutoUpdater = /** @class */ (function (_super) {
    __extends(ElectronGithubAutoUpdater, _super);
    function ElectronGithubAutoUpdater(_a) {
        var _b = _a.baseUrl, baseUrl = _b === void 0 ? 'https://api.github.com' : _b, owner = _a.owner, repo = _a.repo, accessToken = _a.accessToken, _c = _a.allowPrerelease, allowPrerelease = _c === void 0 ? false : _c, _d = _a.forwardEvents, forwardEvents = _d === void 0 ? true : _d;
        var _this = _super.call(this) || this;
        // Adds listeners for IPC Events
        _this._registerIpcListeners = function () {
            electron_1.ipcMain.handle("".concat(constants_1.channelName, ".checkForUpdates"), function (event) {
                _this.checkForUpdates();
                return true;
            });
            electron_1.ipcMain.handle("".concat(constants_1.channelName, ".quitAndInstall"), function (event) {
                _this.quitAndInstall();
                return true;
            });
            electron_1.ipcMain.handle("".concat(constants_1.channelName, ".clearCache"), function (event) {
                _this.clearCache();
                return true;
            });
        };
        /**************************************************************************************************
         *     EventEmitter Overrides
         **************************************************************************************************/
        _this.emit = function (event, args) {
            if (!constants_1.eventTypes.includes(event))
                throw new Error("".concat(event, " is not an event that can be emitted by this class"));
            if (_this.forwardEvents) {
                electron_1.BrowserWindow.getAllWindows().map(function (window) {
                    window.webContents.send(constants_1.channelName, { eventName: event, eventDetails: args });
                });
            }
            if (!args) {
                return _super.prototype.emit.call(_this, event);
            }
            else if (Array.isArray(args)) {
                return _super.prototype.emit.apply(_this, __spreadArray([event], args, false));
            }
            else {
                return _super.prototype.emit.call(_this, event, args);
            }
        };
        _this.on = function (event, listener) {
            if (typeof listener !== 'function')
                throw new Error('Listener must be a function');
            if (!constants_1.eventTypes.includes(event))
                throw new Error("".concat(event, " is not an event emitted by this class"));
            _super.prototype.on.call(_this, event, listener);
            return _this;
        };
        _this.once = function (event, listener) {
            if (typeof listener !== 'function')
                throw new Error('Listener must be a function');
            if (!constants_1.eventTypes.includes(event))
                throw new Error("".concat(event, " is not an event emitted by this class"));
            return _super.prototype.once.call(_this, event, listener);
        };
        // Destroys all related IpcMain listeners
        _this.destroy = function () {
            electron_1.ipcMain.removeAllListeners("".concat(constants_1.channelName, ".checkForUpdates"));
            electron_1.ipcMain.removeAllListeners("".concat(constants_1.channelName, ".quitAndInstall"));
            electron_1.ipcMain.removeAllListeners("".concat(constants_1.channelName, ".clearCache"));
        };
        /**************************************************************************************************
         *     Internal Methods
         **************************************************************************************************/
        _this._emitError = function (error) {
            _this.emit('error', error);
            throw error;
        };
        _this._getLatestRelease = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, releases, filtered, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.allowPrerelease) return [3 /*break*/, 2];
                        return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "/repos/").concat(this.owner, "/").concat(this.repo, "/releases?per_page=100"), {
                                headers: (0, utils_1.generateHeaders)(this.accessToken),
                            })];
                    case 1:
                        response = _a.sent();
                        releases = response.data;
                        filtered = releases.filter(function (release) { return !release.prerelease; });
                        if (filtered.length === 0) {
                            throw new Error('No production releases found');
                        }
                        else {
                            return [2 /*return*/, filtered[0]];
                        }
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "/repos/").concat(this.owner, "/").concat(this.repo, "/releases/latest"), {
                            headers: (0, utils_1.generateHeaders)(this.accessToken),
                        })];
                    case 3:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        // Downloads all required update files for the current platform
        _this._downloadUpdateFiles = function (release) { return __awaiter(_this, void 0, void 0, function () {
            var assets, totalSize, downloaded, assets_1, assets_1_1, file, outputPath, assetDownloadUrl, e_1_1;
            var _this = this;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        assets = (0, utils_1.findRequiredReleaseAssets)(release.assets);
                        totalSize = assets.reduce(function (prev, asset) { return (prev += asset.size); }, 0);
                        downloaded = 0;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, 8, 13]);
                        assets_1 = __asyncValues(assets);
                        _b.label = 2;
                    case 2: return [4 /*yield*/, assets_1.next()];
                    case 3:
                        if (!(assets_1_1 = _b.sent(), !assets_1_1.done)) return [3 /*break*/, 6];
                        file = assets_1_1.value;
                        outputPath = path_1.default.join(constants_1.tempDir, file.name);
                        assetDownloadUrl = "".concat(this.baseUrl, "/repos/").concat(this.owner, "/").concat(this.repo, "/releases/assets/").concat(file.id);
                        return [4 /*yield*/, this._downloadUpdateFile(assetDownloadUrl, outputPath, function (event) {
                                downloaded += event.loaded;
                                _this.emit('update-downloading', {
                                    size: totalSize,
                                    progress: downloaded,
                                    percent: Math.round((downloaded * 100) / totalSize),
                                });
                            })];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [3 /*break*/, 2];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _b.trys.push([8, , 11, 12]);
                        if (!(assets_1_1 && !assets_1_1.done && (_a = assets_1.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _a.call(assets_1)];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13:
                        // Write a cache file containing the release ID
                        fs_1.default.writeFileSync(constants_1.releaseIdCachePath, release.id.toString(), { encoding: 'utf-8' });
                        console.log('Done downloading update files');
                        return [2 /*return*/];
                }
            });
        }); };
        // Downloads a single file
        _this._downloadUpdateFile = function (assetUrl, outputPath, onProgressEvent) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var data, writer;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, axios_1.default.get(assetUrl, {
                                        headers: __assign(__assign({}, (0, utils_1.generateHeaders)(this.accessToken)), { Accept: 'application/octet-stream' }),
                                        responseType: 'stream',
                                    })];
                                case 1:
                                    data = (_a.sent()).data;
                                    writer = fs_1.default.createWriteStream(outputPath);
                                    // Emit a progress event when a chunk is downloaded
                                    data.on('data', function (chunk) {
                                        onProgressEvent({ loaded: chunk.length });
                                    });
                                    // Pipe data into a writer to save it to the disk rather than keeping it in memory
                                    data.pipe(writer);
                                    return [2 /*return*/, data.on('end', function () {
                                            return resolve(true);
                                        })];
                            }
                        });
                    }); })];
            });
        }); };
        // Preps the default electron autoUpdater to install the update
        _this._loadElectronAutoUpdater = function (release) {
            _this.emit('update-downloaded', {
                releaseName: release.name,
                releaseNotes: release.body || '',
                releaseDate: new Date(release.published_at),
                updateUrl: release.html_url,
            });
            if (!electron_is_dev_1.default) {
                _this.autoUpdater.setFeedURL({ url: constants_1.platformConfig.feedUrl });
            }
        };
        // Uses electron autoUpdater to install the downloaded update
        _this._installDownloadedUpdate = function () {
            if (!electron_is_dev_1.default) {
                _this.autoUpdater.checkForUpdates();
            }
            else {
                console.error('Cannot install an update while running in dev mode.');
            }
        };
        /**************************************************************************************************
         *     autoUpdater Overrides
         **************************************************************************************************/
        _this.checkForUpdates = function () { return __awaiter(_this, void 0, void 0, function () {
            var latestRelease, latestReleaseVersion, releaseId, currentVersion, cachedReleaseId, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        this.emit('checking-for-update');
                        return [4 /*yield*/, this._getLatestRelease()];
                    case 1:
                        latestRelease = _a.sent();
                        latestReleaseVersion = latestRelease.tag_name;
                        releaseId = latestRelease.id;
                        currentVersion = electron_1.app.getVersion();
                        cachedReleaseId = (0, utils_1.getCachedReleaseId)();
                        if (!(0, semver_1.gte)(currentVersion, latestReleaseVersion)) return [3 /*break*/, 2];
                        this.emit('update-not-available');
                        return [3 /*break*/, 6];
                    case 2:
                        if (!(0, semver_1.gt)(latestReleaseVersion, currentVersion)) return [3 /*break*/, 5];
                        this.emit('update-available');
                        if (!(cachedReleaseId !== releaseId)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._downloadUpdateFiles(latestRelease)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        // Load the built in electron auto updater with the files we generated
                        this._loadElectronAutoUpdater(latestRelease);
                        // Use the built in electron auto updater to install the update
                        this._installDownloadedUpdate();
                        return [3 /*break*/, 6];
                    case 5:
                        // If we get here, there is a bug in the above logic.
                        console.log({
                            currentVersion: currentVersion,
                            latestReleaseVersion: latestReleaseVersion,
                            latestRelease: latestRelease,
                            releaseId: releaseId,
                            cachedReleaseId: cachedReleaseId,
                        });
                        throw new Error('Error in cache and release semver comparison. This is not a bug in your code, this is a problem with the library.');
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        e_2 = _a.sent();
                        this._emitError(e_2);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        _this.quitAndInstall = function () {
            try {
                _this.autoUpdater.quitAndInstall();
            }
            catch (e) {
                _this._emitError(e);
            }
        };
        _this.clearCache = function () {
            console.log('Clearing autoUpdater cache...');
            try {
                fs_1.default.rmSync(constants_1.tempDir, { recursive: true, force: true });
                if (fs_1.default.existsSync(constants_1.tempDir))
                    throw new Error('Failed to clear temp directory');
                (0, utils_1.getTempDir)();
                console.log('Done clearing autoUpdater cache');
                _this.emit('update-not-available');
            }
            catch (e) {
                _this._emitError(e);
            }
        };
        _this.baseUrl = baseUrl;
        _this.owner = owner;
        _this.repo = repo;
        _this.accessToken = accessToken;
        _this.autoUpdater = electron_1.autoUpdater;
        _this.allowPrerelease = allowPrerelease;
        _this.forwardEvents = forwardEvents;
        // Register IPC listeners
        _this._registerIpcListeners();
        // Setup a listener for certain events emitted from electron's default autoUpdater, as that is still used
        // by this package to install updates, and we want the events forwarded properly
        _this.autoUpdater.addListener('before-quit-for-update', _this.emit);
        return _this;
    }
    return ElectronGithubAutoUpdater;
}(events_1.default));
// Export function that returns new instance of the updater, to closer match electron's autoUpdater API
var autoUpdater = function (config) {
    return new ElectronGithubAutoUpdater(config);
};
exports.autoUpdater = autoUpdater;
