export default {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : 'tally-bot',
      script    : '.dist/bot.js',
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
      'post-deploy' : 'npm i && pm2 reload ecosystem.config.js --env production --node-args="--max-old-space-size=2048"'
    }
  }
}