module.exports = {
  apps: [
    {
      name: 'pocketlawyer',
      cwd: '/home/ubuntu/pocketlawyer',
      script: 'pnpm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_TELEMETRY_DISABLED: 1
      },
      error_file: '/home/ubuntu/.pm2/logs/pocketlawyer-error.log',
      out_file: '/home/ubuntu/.pm2/logs/pocketlawyer-out.log',
      time: true,
      min_uptime: 10000,
      max_restarts: 3,
      restart_delay: 5000,
      kill_timeout: 3000,
      wait_ready: true
    }
  ]
}