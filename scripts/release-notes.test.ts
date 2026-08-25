import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const scriptPath = join(dirname(fileURLToPath(import.meta.url)), 'release-notes.js');
const repositories: string[] = [];

const git = (cwd: string, ...args: string[]) =>
	execFileSync('git', args, {
		cwd,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
	});

const createRepository = () => {
	const cwd = mkdtempSync(join(tmpdir(), 'rde-release-notes-'));
	repositories.push(cwd);
	git(cwd, 'init');
	git(cwd, 'config', 'user.email', 'release-notes@example.com');
	git(cwd, 'config', 'user.name', 'Release Notes Test');
	return cwd;
};

const commit = (cwd: string, filename: string, content: string, message: string) => {
	writeFileSync(join(cwd, filename), content);
	git(cwd, 'add', filename);
	git(cwd, 'commit', '-m', message);
};

afterEach(() => {
	repositories.splice(0).forEach(repository => rmSync(repository, { force: true, recursive: true }));
});

describe('release notes script', () => {
	it('prints commits between two tags as an oldest-first Markdown list', () => {
		const cwd = createRepository();
		commit(cwd, 'release.txt', 'initial', 'chore: prepare initial release');
		git(cwd, 'tag', 'v1.0.0');
		commit(cwd, 'release.txt', 'fixed', 'fix: correct canvas position');
		commit(cwd, 'feature.txt', 'pages', 'feat: add multiple pages');
		git(cwd, 'tag', 'v1.1.0');

		const result = spawnSync(process.execPath, [scriptPath, 'v1.0.0', 'v1.1.0'], {
			cwd,
			encoding: 'utf8',
		});

		expect(result.status).toBe(0);
		expect(result.stdout.trim()).toBe('- fix: correct canvas position\n- feat: add multiple pages');
		expect(result.stderr).toBe('');
	}, 20_000);

	it('reports the required arguments when either tag is missing', () => {
		const result = spawnSync(process.execPath, [scriptPath], {
			encoding: 'utf8',
		});

		expect(result.status).toBe(1);
		expect(result.stderr.trim()).toBe('Usage: npm run release:notes <from-tag> <to-tag>');
	});

	it('identifies a tag that does not exist', () => {
		const cwd = createRepository();
		commit(cwd, 'release.txt', 'initial', 'chore: prepare initial release');
		git(cwd, 'tag', 'v1.0.0');

		const result = spawnSync(process.execPath, [scriptPath, 'v1.0.0', 'v9.9.9'], {
			cwd,
			encoding: 'utf8',
		});

		expect(result.status).toBe(1);
		expect(result.stderr.trim()).toBe('Unknown tag: v9.9.9');
	});
});
