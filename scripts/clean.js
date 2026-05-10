const del = require('del');

del.sync(['dist/**', 'lib/**', 'docs/**']);
