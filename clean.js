const del = require('del');
const fs = require('fs-extra');

del.sync(['dist/**', 'lib/**', 'docs/**']);

fs.copySync('public', 'docs');
