const { FuseBox } = require('fuse-box');
const statements = require('@tsx-control-statements/transformer').default;

const fuse = FuseBox.init({
	homeDir: '.',
	output: './dist/$name.js',
	transformers: {
		before: [statements()]
	},
	useTypescriptCompiler: true,
	cache: false,
	target: 'browser',
	globals: { default: '*' },
});

fuse.bundle('example').instructions('> index.tsx');
fuse.run();
