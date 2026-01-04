module.exports = {
  apps: [
    {
      name: 'h2o-premium',
      script: 'dist-server/server.js',
      instances: '2',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time: true,
    },
  ],
}
