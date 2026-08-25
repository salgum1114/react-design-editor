const { execFileSync } = require('node:child_process');

const [, , fromTag, toTag] = process.argv;

if (!fromTag || !toTag) {
	console.error('Usage: npm run release:notes <from-tag> <to-tag>');
	process.exit(1);
}

for (const tag of [fromTag, toTag]) {
	try {
		execFileSync('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${tag}^{commit}`], { stdio: 'ignore' });
	} catch {
		console.error(`Unknown tag: ${tag}`);
		process.exit(1);
	}
}

const notes = execFileSync(
	'git',
	['log', `${fromTag}..${toTag}`, '--reverse', '--pretty=format:- %s'],
	{ encoding: 'utf8' },
);

process.stdout.write(notes);
