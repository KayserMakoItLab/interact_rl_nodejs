module.exports = {
  apps: [
    {
      name: 'interact_rl_nodejs',
      script: 'app.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 80,
      },
    },
  ],
};
