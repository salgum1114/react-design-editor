declare const require: (name: string) => any;
declare const process: {
	platform: string;
	env: Record<string, string | undefined>;
};

const fs = require('fs') as {
	statSync: (target: string) => { isDirectory: () => boolean };
	readdirSync: (target: string) => string[];
};

const path = require('path') as {
	join: (...parts: string[]) => string;
	extname: (target: string) => string;
};

const ttfinfo = require('ttfinfo') as {
	get: (file: string, callback: (_error: unknown, fontMeta: any) => void) => void;
	getSync: (file: string) => any;
};

type Platform = 'osx' | 'windows' | 'linux';

type FontDescriptor = {
	family: string;
	subFamily: string;
	postscript: string;
	file: string;
	systemFont: boolean;
};

type ExtendedFont = {
	family: string;
	systemFont: boolean;
	subFamilies: string[];
	files: Record<string, string>;
	postscriptNames: Record<string, string>;
};

type SystemFontsOptions = {
	ignoreSystemFonts?: boolean;
	customDirs?: string[];
};

const getPlatform = (): Platform => {
	if (process.platform === 'darwin') {
		return 'osx';
	}
	if (/win/.test(process.platform)) {
		return 'windows';
	}
	return 'linux';
};

const recGetFile = (target: string): string[] => {
	let stats: { isDirectory: () => boolean };
	try {
		stats = fs.statSync(target);
	} catch (_error) {
		return [];
	}

	if (stats.isDirectory()) {
		let files: string[] = [];
		try {
			files = fs.readdirSync(target);
		} catch (error) {
			console.error(error);
		}
		return files.reduce<string[]>((allFiles, fileName) => {
			return allFiles.concat(recGetFile(path.join(target, fileName)));
		}, []);
	}

	const extension = path.extname(target).toLowerCase();
	if (extension === '.ttf' || extension === '.otf' || extension === '.ttc' || extension === '.dfont') {
		return [target];
	}

	return [];
};

const filterReadableFonts = (fontFiles: string[]) => {
	return fontFiles.filter(file => {
		const extension = path.extname(file).toLowerCase();
		return extension === '.ttf' || extension === '.otf';
	});
};

const tableToObj = (obj: Record<string, string>, file: string, systemFont: boolean): FontDescriptor => ({
	family: obj['1'],
	subFamily: obj['2'],
	postscript: obj['6'],
	file,
	systemFont,
});

const extendedReducer = (fonts: Map<string, ExtendedFont>, descriptor: FontDescriptor) => {
	const { family, subFamily, file, postscript, systemFont } = descriptor;

	if (fonts.has(family)) {
		const existingFont = fonts.get(family)!;
		return fonts.set(family, {
			...existingFont,
			systemFont: existingFont.systemFont === false ? false : systemFont,
			subFamilies: [...existingFont.subFamilies, subFamily],
			files: {
				...existingFont.files,
				[subFamily]: file,
			},
			postscriptNames: {
				...existingFont.postscriptNames,
				[subFamily]: postscript,
			},
		});
	}

	return fonts.set(family, {
		family,
		systemFont,
		subFamilies: [subFamily],
		files: {
			[subFamily]: file,
		},
		postscriptNames: {
			[subFamily]: postscript,
		},
	});
};

class SystemFonts {
	private readonly ignoreSystemFonts: boolean;

	private readonly customDirs: string[];

	private readonly customDirSet: Set<string>;

	private readonly customFontFiles: Set<string>;

	private readonly allFontFiles: string[];

	private readonly fontFiles: string[];

	constructor(options: SystemFontsOptions = {}) {
		const { ignoreSystemFonts = false, customDirs = [] } = options;

		if (!Array.isArray(customDirs)) {
			throw new Error('customDirs must be an array of folder path strings');
		}

		this.ignoreSystemFonts = ignoreSystemFonts;
		this.customDirs = customDirs;
		this.customDirSet = new Set(customDirs);
		this.customFontFiles = new Set();
		this.allFontFiles = this.getFontFiles();
		this.fontFiles = filterReadableFonts(this.allFontFiles);
	}

	private getFontFiles() {
		let directories = [...this.customDirs];
		const platform = getPlatform();

		if (platform === 'osx') {
			const home = process.env.HOME || '';
			directories = directories.concat([
				path.join(home, 'Library', 'Fonts'),
				path.join('/', 'Library', 'Fonts'),
				path.join('/', 'System', 'Library', 'Fonts'),
			]);
		} else if (platform === 'windows') {
			const winDir = process.env.windir || process.env.WINDIR || '';
			directories = directories.concat([path.join(winDir, 'Fonts')]);
		} else {
			const home = process.env.HOME || '';
			directories = directories.concat([
				path.join(home, '.fonts'),
				path.join(home, '.local', 'share', 'fonts'),
				path.join('/', 'usr', 'share', 'fonts'),
				path.join('/', 'usr', 'local', 'share', 'fonts'),
			]);
		}

		return directories.reduce<string[]>((allFiles, directory) => {
			const files = recGetFile(directory);
			if (this.customDirSet.has(directory)) {
				files.forEach(file => this.customFontFiles.add(file));
			}
			return allFiles.concat(files);
		}, []);
	}

	private getFilteredFontFiles() {
		if (!this.ignoreSystemFonts) {
			return [...this.fontFiles];
		}

		return this.fontFiles.filter(file => this.customFontFiles.has(file));
	}

	getAllFontFilesSync() {
		return [...this.allFontFiles];
	}

	getFontFilesSync() {
		return [...this.fontFiles];
	}

	getFontsExtended() {
		const filteredFontFiles = this.getFilteredFontFiles();

		return Promise.all(
			filteredFontFiles.map(
				file =>
					new Promise<FontDescriptor | null>(resolve => {
						ttfinfo.get(file, (_error, fontMeta) => {
							if (!fontMeta) {
								resolve(null);
								return;
							}

							resolve(tableToObj(fontMeta.tables.name, file, !this.customFontFiles.has(file)));
						});
					}),
			),
		).then(fonts => {
			const groupedFonts = fonts
				.filter((font): font is FontDescriptor => Boolean(font))
				.reduce(extendedReducer, new Map<string, ExtendedFont>());

			return [...groupedFonts.values()].sort((left, right) => left.family.localeCompare(right.family));
		});
	}

	getFontsExtendedSync() {
		const groupedFonts = this.getFilteredFontFiles()
			.reduce<FontDescriptor[]>((fonts, file) => {
				let data: any;
				try {
					data = ttfinfo.getSync(file);
				} catch (_error) {
					return fonts;
				}

				return fonts.concat([tableToObj(data.tables.name, file, !this.customFontFiles.has(file))]);
			}, [])
			.reduce(extendedReducer, new Map<string, ExtendedFont>());

		return [...groupedFonts.values()].sort((left, right) => left.family.localeCompare(right.family));
	}

	getFonts() {
		return this.getFontsExtended().then(fontList => {
			const names = fontList.reduce<Record<string, number>>((result, { family }) => {
				result[family] = 1;
				return result;
			}, {});

			return Object.keys(names).sort((left, right) => left.localeCompare(right));
		});
	}

	getFontsSync() {
		const names = this.getFontsExtendedSync().reduce<Record<string, number>>((result, { family }) => {
			result[family] = 1;
			return result;
		}, {});

		return Object.keys(names).sort((left, right) => left.localeCompare(right));
	}
}

export default SystemFonts;
