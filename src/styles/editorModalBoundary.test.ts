/// <reference types="node" />

import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

const sourceRoot = new URL('../', import.meta.url);

const collectTsxFiles = (directory: URL): URL[] =>
	readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const entryUrl = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
		if (entry.isDirectory()) {
			return collectTsxFiles(entryUrl);
		}
		return extname(entry.name) === '.tsx' ? [entryUrl] : [];
	});

describe('editor modal portal boundary', () => {
	it('applies the editor theme boundary to every Ant Design modal', () => {
		const missingBoundary: string[] = [];
		let modalCount = 0;

		for (const file of collectTsxFiles(sourceRoot)) {
			const source = readFileSync(file, 'utf8');
			const modalTags = source.match(/<Modal\b[\s\S]*?>/g) ?? [];
			modalCount += modalTags.length;

			for (const tag of modalTags) {
				if (!tag.includes('rootClassName="rde-editor-modal"')) {
					missingBoundary.push(join(file.pathname, tag.split('\n')[0].trim()));
				}
			}
		}

		expect(modalCount).toBeGreaterThan(0);
		expect(missingBoundary).toEqual([]);
	});
});
