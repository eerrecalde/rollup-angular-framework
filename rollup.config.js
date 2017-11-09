import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babelrc from 'babelrc-rollup'; // eslint-disable-line
import uglify from 'rollup-plugin-uglify';
import pkg from './package.json';


const babelConfig = {
  presets: [
    ['env', {
      targets: {
        browsers: ['last 2 versions'],
      },
      loose: true,
    }],
  ],
  plugins: [
    'external-helpers',
  ],
};

const plugins = [
  resolve({
    jsnext: true,
    main: true,
    browser: true,
  }), // so Rollup can find `ms`
  commonjs(), // so Rollup can convert `ms` to an ES module
  eslint(),
  babel(babelrc({
    config: babelConfig,
    exclude: 'node_modules/**',
  })),
];

export default [
  // browser-friendly UMD build minified
  {
    input: 'src/index.js',
    name: pkg.namejs,
    external: ['angular'],
    globals: {
      angular: 'angular',
    },
    output: {
      file: pkg.browser,
      format: 'umd',
    },
    plugins: plugins.concat(uglify()),
    sourcemap: true,
  },

  // browser-friendly UMD build
  {
    input: 'src/index.js',
    name: pkg.namejs,
    external: ['angular'],
    globals: {
      angular: 'angular',
    },
    output: {
      file: pkg.browser_unminified,
      format: 'umd',
    },
    plugins,
    sourcemap: true,
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: 'src/index.js',
    external: ['angular', 'debug'],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
  },
];
