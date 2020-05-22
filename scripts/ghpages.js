const ghpages = required('gh-pages');

ghpages.publish('docs', {
	repo: 'https://github.com/salgum1114/react-design-editor.git',
	message: 'auto commit',
	user: {
		name: 'salgum1114',
		email: 'salgum1112@gmail.com',
	},
});
