### Library generator with rollup

#### Tools/Libs used

##### Rollup
To generate final bundle
[Rollup](https://rollupjs.org/)

##### Babel
To support es6 in the src files and tests
[Babel](https://babeljs.io/)

##### Eslint
To lint code before bundling
[Eslint](https://eslint.org/)

##### Jest
To unit test code before bundling
[Jest](https://facebook.github.io/jest/)

####### Why jest?
Because it provides super fast unit and integration test toolset with no configuration needed, all included (coverage, watcher, and snapshots, between others)

#### Development notes and concepts

We thought it would be ideal to have a solution which permits us to remove all the unused code whenever is possible.
Between other techniques around, there is the concept of [Tree Shake (dead code elimination)](https://rollupjs.org/#tree-shaking)
which relies on ES modules to detect and remove (or better said, not include) unused code.
For tree shake to work, it is necessary to generate pure ES bundle.

Also, by creating a library which bundles ES modules, we are also covering applications developed with any of the frameworks
out there such as React, Vue, or Angular2 as they all are being used with webpack.

Webpack does implement tree shaking only when bundling ES code and when used together with minification plugin in the build process.
In our case we are using [uglifyjs-webpack-plugin](https://github.com/webpack-contrib/uglifyjs-webpack-plugin)
