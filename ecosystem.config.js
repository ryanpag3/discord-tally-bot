{
  apps : [
    {
      name      : "tally-bot",
      script   : {
        script: "./dist/bot.js"
      },
      env: {
        "COMMON_VARIABLE": "true"
      },
      env_production : {
        NODE_ENV: "production"
      }
    }
  ],
  deploy : {
    production : {
      user : "ryan",
      host : "localhost",
      ref  : "origin/master",
      repo : "https://github.com/ryanpage42/discord-tally-bot.git",
      path : "/var/opt/production/discord-tally-bot",
      post-deploy : "npm i && tsc && pm2 reload ecosystem.config.js"
    }
  }
}