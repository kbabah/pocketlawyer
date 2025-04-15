module.exports = {
  apps: [
    {
      name: 'pocketlawyer',
      cwd: '/home/ubuntu/pocketlawyer',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/ubuntu/.pm2/logs/pocketlawyer-error.log',
      out_file: '/home/ubuntu/.pm2/logs/pocketlawyer-out.log',
      time: true,
      min_uptime: 5000,
      max_restarts: 5,
      restart_delay: 4000
    }
  ]
}