const webpack = require('webpack');
const path = require('path');

module.exports = function (options) {
  const lazyImports = [
    '@nestjs/microservices',
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
    'cache-manager',
    'class-validator',
    'class-transformer',
    'fastify',
    'point-of-view',
    // MongoDB optional dependencies
    'snappy',
    'aws4',
    'mongodb-client-encryption',
    'kerberos',
    '@aws-sdk/credential-providers',
    '@mongodb-js/zstd',
    'snappy/package.json',
    'socks',
  ];

  return {
    ...options,
    externals: [
      // Treat bcrypt as a commonjs external so it compiles to require('bcrypt')
      { bcrypt: 'commonjs bcrypt' },
      // swagger-ui-dist resolves its assets via path.resolve(__dirname) at runtime;
      // inlining it (including subpath imports like absolute-path.js) breaks that
      // resolution, so keep every import from it as a real require()
      ({ request }, callback) => {
        if (request === 'swagger-ui-dist' || request.startsWith('swagger-ui-dist/')) {
          return callback(null, `commonjs ${request}`);
        }
        callback();
      },
    ],
    optimization: {
      ...options.optimization,
      minimize: false,
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.some((item) => resource.startsWith(item))) {
            try {
              require.resolve(resource);
              return false;
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
    ],
  };
};
