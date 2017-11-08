import pkg from './package.json';

export default [

	// CommonJS (for Node) and ES module (for bundlers) build.
	{
		input: 'lib/index.js',
		output: [
			// { file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' },
		],
	},
];
