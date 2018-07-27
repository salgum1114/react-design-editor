'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ttfinfo = require('ttfinfo');

var _ttfinfo2 = _interopRequireDefault(_ttfinfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var getPlatform = function getPlatform() {
    return process.platform === 'darwin' ? 'osx' : /win/.test(process.platform) ? 'windows' : 'linux';
};

var recGetFile = function recGetFile(target) {
    var stats = void 0;
    try {
        stats = _fs2.default.statSync(target);
    } catch (e) {
        // console.error(e);
        return [];
    }
    if (stats.isDirectory()) {
        var files = void 0;
        try {
            files = _fs2.default.readdirSync(target);
        } catch (e) {
            console.error(e);
        }
        return files.reduce(function (arr, f) {
            return arr.concat(recGetFile(_path2.default.join(target, f)));
        }, []);
    } else {
        var ext = _path2.default.extname(target).toLowerCase();
        if (ext === '.ttf' || ext === '.otf' || ext === '.ttc' || ext === '.dfont') {
            return [target];
        } else {
            return [];
        }
    }
};

var filterReadableFonts = function filterReadableFonts(arr) {
    return arr.filter(function (f) {
        var extension = _path2.default.extname(f).toLowerCase();
        return extension === '.ttf' || extension === '.otf';
    });
};

var tableToObj = function tableToObj(obj, file, systemFont) {
    return {
        family: obj['1'],
        subFamily: obj['2'],
        postscript: obj['6'],
        file: file,
        systemFont: systemFont
    };
};

var extendedReducer = function extendedReducer(m, _ref) {
    var family = _ref.family,
        subFamily = _ref.subFamily,
        file = _ref.file,
        postscript = _ref.postscript,
        systemFont = _ref.systemFont;

    if (m.has(family)) {
        var origFont = m.get(family);
        return m.set(family, _extends({}, origFont, {
            systemFont: origFont.systemFont === false ? false : systemFont,
            subFamilies: [].concat(_toConsumableArray(origFont.subFamilies), [subFamily]),
            files: _extends({}, origFont.files, _defineProperty({}, subFamily, file)),
            postscriptNames: _extends({}, origFont.postscriptNames, _defineProperty({}, subFamily, postscript))
        }));
    } else {
        return m.set(family, {
            family: family,
            systemFont: systemFont,
            subFamilies: [subFamily],
            files: _defineProperty({}, subFamily, file),
            postscriptNames: _defineProperty({}, subFamily, postscript)
        });
    }
};

var SystemFonts = function SystemFonts() {
    var _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _options$ignoreSystem = options.ignoreSystemFonts,
        ignoreSystemFonts = _options$ignoreSystem === undefined ? false : _options$ignoreSystem,
        _options$customDirs = options.customDirs,
        customDirs = _options$customDirs === undefined ? [] : _options$customDirs;


    if (!Array.isArray(customDirs)) {
        throw new Error('customDirs must be an array of folder path strings');
    }

    var customDirSet = new Set(customDirs);
    var customFontFiles = new Set();

    var getFontFiles = function getFontFiles() {

        var directories = [];

        if (customDirs.length > 0) {
            directories = [].concat(_toConsumableArray(customDirs));
        }

        var platform = getPlatform();
        if (platform === 'osx') {
            var home = process.env.HOME;
            directories = [].concat(_toConsumableArray(directories), [_path2.default.join(home, 'Library', 'Fonts'), _path2.default.join('/', 'Library', 'Fonts'), _path2.default.join('/', 'System', 'Library', 'Fonts')]);
        } else if (platform === 'windows') {
            var winDir = process.env.windir || process.env.WINDIR;
            directories = [].concat(_toConsumableArray(directories), [_path2.default.join(winDir, 'Fonts')]);
        } else {
            // some flavor of Linux, most likely
            var _home = process.env.HOME;
            directories = [].concat(_toConsumableArray(directories), [_path2.default.join(_home, '.fonts'), _path2.default.join(_home, '.local', 'share', 'fonts'), _path2.default.join('/', 'usr', 'share', 'fonts'), _path2.default.join('/', 'usr', 'local', 'share', 'fonts')]);
        }

        return directories.reduce(function (arr, d) {
            var files = recGetFile(d);
            if (customDirSet.has(d)) {
                files.forEach(function (f) {
                    return customFontFiles.add(f);
                });
            }
            return arr.concat(files);
        }, []);
    };

    var allFontFiles = getFontFiles();

    // this list includes all TTF, OTF, OTC, and DFONT files
    this.getAllFontFilesSync = function () {
        return [].concat(_toConsumableArray(allFontFiles));
    };

    var fontFiles = filterReadableFonts(allFontFiles);

    // this list includes all TTF and OTF files (these are the ones we parse in this lib)
    this.getFontFilesSync = function () {
        return [].concat(_toConsumableArray(fontFiles));
    };

    this.getFontsExtended = function () {
        return new Promise(function (resolve, reject) {

            var promiseList = [];

            var filteredFontFiles = !ignoreSystemFonts ? [].concat(_toConsumableArray(fontFiles)) : fontFiles.filter(function (f) {
                return customFontFiles.has(f);
            });

            filteredFontFiles.forEach(function (file, i) {
                promiseList.push(new Promise(function (resolve1) {
                    _ttfinfo2.default.get(file, function (err, fontMeta) {
                        if (!fontMeta) {
                            resolve1(null);
                        } else {
                            resolve1(tableToObj(fontMeta.tables.name, file, !customFontFiles.has(file)));
                        }
                    });
                }));
            });
            Promise.all(promiseList).then(function (res) {

                var names = res.filter(function (data) {
                    return data ? true : false;
                }).reduce(extendedReducer, new Map());

                var namesArr = [].concat(_toConsumableArray(names.values())).sort(function (a, b) {
                    return a.family.localeCompare(b.family);
                });

                resolve(namesArr);
            }, function (err) {
                return reject(err);
            });
        });
    };

    this.getFontsExtendedSync = function () {

        var filteredFontFiles = !ignoreSystemFonts ? [].concat(_toConsumableArray(fontFiles)) : fontFiles.filter(function (f) {
            return customFontFiles.has(f);
        });

        var names = filteredFontFiles.reduce(function (arr, file) {
            var data = void 0;
            try {
                data = _ttfinfo2.default.getSync(file);
            } catch (e) {
                return arr;
            }
            return arr.concat([tableToObj(data.tables.name, file, !customFontFiles.has(file))]);
        }, []).filter(function (data) {
            return data ? true : false;
        }).reduce(extendedReducer, new Map());

        var namesArr = [].concat(_toConsumableArray(names.values())).sort(function (a, b) {
            return a.family.localeCompare(b.family);
        });

        return namesArr;
    };

    this.getFonts = function () {
        return new Promise(function (resolve, reject) {
            _this.getFontsExtended().then(function (fontList) {
                var names = fontList.map(function (_ref2) {
                    var family = _ref2.family;
                    return family;
                }).reduce(function (obj, name) {
                    obj[name] = 1;
                    return obj;
                }, {});
                resolve(Object.keys(names).sort(function (a, b) {
                    return a.localeCompare(b);
                }));
            }).catch(function (err) {
                return reject(err);
            });
        });
    };

    this.getFontsSync = function () {
        var names = _this.getFontsExtendedSync().map(function (_ref3) {
            var family = _ref3.family;
            return family;
        }).reduce(function (obj, name) {
            obj[name] = 1;
            return obj;
        }, {});
        return Object.keys(names).sort(function (a, b) {
            return a.localeCompare(b);
        });
    };
};

exports.default = SystemFonts;