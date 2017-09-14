import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import pkg from './package.json';

const babelConfig = {
  'presets': [
    ['env', {
      'targets': {
        'browsers': ['last 2 versions']
      },
      'loose': true
    }]
  ]
};

export default [
	// browser-friendly UMD build
	{
		entry: 'src/main.js',
		dest: pkg.browser,
		format: 'umd',
		moduleName: 'howLongUntilLunch',
		plugins: [
			resolve(), // so Rollup can find `ms`
			commonjs(), // so Rollup can convert `ms` to an ES module
			babel(babelrc({
	      addExternalHelpersPlugin: false,
	      config: babelConfig,
	      exclude: 'node_modules/**'
	    }))
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// the `targets` option which can specify `dest` and `format`)
	{
		entry: 'src/main.js',
		external: ['ms'],
		targets: [
			{ dest: pkg.main, format: 'cjs' },
			{ dest: pkg.module, format: 'es' }
		]
	}
];
