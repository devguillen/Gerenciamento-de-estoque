module.exports = {
  apps: [
    {
      name: 'stocksync-web-admin-front',
      script: './server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3007,
      },
      // Configurações de log
      error_file: '~/.pm2/logs/stocksync-web-admin-front-error.log',
      out_file: '~/.pm2/logs/stocksync-web-admin-front-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Auto restart
      autorestart: true,
      max_memory_restart: '500M',

      // Reiniciar se usar mais memória que o limite
      watch: false,

      // Delay entre reinicializações
      restart_delay: 4000,

      // Configurações de cluster
      min_uptime: '10s',
      max_restarts: 10,
    },
  ],
};

