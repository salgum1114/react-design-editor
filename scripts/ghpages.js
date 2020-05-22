const ghpages = require('gh-pages');

ghpages.publish(
	'docs',
	{
		repo: 'https://github.com/salgum1114/react-design-editor.git',
		message: 'published https://salgum1114.github.io/react-design-editor',
		user: {
			name: 'salgum1114',
			email: 'salgum1112@gmail.com',
		},
	},
	function(err) {
		if (err) {
			console.error(err);
		} else {
			console.log('published https://salgum1114.github.io/react-design-editor');
		}
	},
);
