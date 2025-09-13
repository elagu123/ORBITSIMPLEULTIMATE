module.exports = {
  apps: [
    {
      name: 'orbit-ai-agent',
      script: './server/multi-llm-agent.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      error_file: './logs/ai-agent-error.log',
      out_file: './logs/ai-agent-out.log',
      log_file: './logs/ai-agent-combined.log',
      time: true
    },
    {
      name: 'orbit-frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};