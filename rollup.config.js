import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
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
  ],
  "plugins": [
    "external-helpers"
  ]
};

const plugins = [
  resolve(), // so Rollup can find `ms`
  commonjs(), // so Rollup can convert `ms` to an ES module
  eslint(),
  babel(babelrc({
    config: babelConfig,
    exclude: 'node_modules/**'
  }))
]

export default [

	// browser-friendly UMD build
	{
		input: 'lib/index.js',
		name: 'libMod',
		external: ['angular'],
		globals: {
			angular: 'angular'
		},
		output: {
			file: pkg.browser,
			format: 'umd'
		},
		plugins: plugins
	},
  {
		input: 'lib/core.js',
		name: 'test',
		output: {
			file: 'dist/core.umd.js',
			format: 'umd'
		},
		plugins: plugins
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	{
		input: 'lib/index.js',
		external: ['angular'],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		]
	},
  {
		input: 'lib/core.js',
		external: ['angular'],
		output: [
			{ file: 'dist/core.cjs.js', format: 'cjs' },
			{ file: 'dist/core.esm.js', format: 'es' }
		]
	}
];
