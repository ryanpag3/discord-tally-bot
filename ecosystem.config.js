module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : 'tally-bot',
      script    : {
        script: '/usr/local/lib/node_modules/pm2/node_modules/.bin/ts-node',
        args: 'bot.ts'
      },
      env: {
        COMMON_VARIABLE: 'true'
      },
      env_production : {
        NODE_ENV: 'production'
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : 'ryan',
      host : 'localhost',
      ref  : 'origin/master',
      repo : 'https://github.com/ryanpage42/discord-tally-bot.git',
      path : '/var/opt/production/discord-tally-bot',
      'post-deploy' : 'npm i && pm2 reload ecosystem.config.js --env production --node-args="--max-old-space-size=2048"',
    }
  }
}