# [TallyBot](https://discordbots.org/bot/494241511714586634)
**Tally Bot** lets you keep track of stuff. Count points for teams, burps in chat, etc. 

Track the length of time using timers and see how long it took Billy to make that taco run. 

Tallies and timers are kept track of using a name which you specify when you create it, as well as an optional description. 

Have fun! Don't forget to provide feedback using GitHub issues.

## Changelog
[Click here](https://github.com/ryanpage42/discord-tally-bot/blob/master/CHANGELOG.md)

# Commands
Cases where `[]` is shown should be replaced in its entirety with the value it represents. (i.e `!tb add my-tally` or `!tb rm my-tally`)

## Permissions
On installation, Tally Bot will allow any user to run any command. Admins can set permissions for commands to allow only users with a certain role to run them.

`!tb -role [Role]` - Set all permissions to a specific role. Server administrators can **always** run this.

`!tb [command] -role [Role]` - Set a specific command's role. Server administrators can **always** run this.

`!tb permissions` - Display all current permissions.

`!tb -role -role [Role]` - To allow users to grant permission access (global and per command)

## Tallies

### Scoping
Tallies are defined as *Channel Tallies* when initially created. You will see that identified by **[C]** in the relevant commands. You are also allowed to convert these to *Global Tallies* identified by **[G]**.

All relevent tally commands can be either used for channel tallies or global tallies. Simply add `-g` after the command.

`!tb global [name]` - Set a **channel** tally to be globally scoped.

`!tb channel [name]` - Set a **global** tally to be channel scoped.

For example, if I wanted to bump a **global** tally named *test*, I would issue this command

`!tb bump -g test` 

### Basic

`!tb` - This is the prefix. All commands should lead with this followed by a space. For example: `!tb show`

`!tb help` - Get a list of commands.

`!tb show` - List all tallies created in this channel.

`!tb details [name]` - Get details of a tally.

`!tb get [name]` - Same as above.

`!tb suggest [suggestion]` - Make a suggestion directly to support channel.

`!tb bug [bug report]` - Make a bug report directly to the support channel.

`!tb report [bug report]` - Same as above.

### Manage

`!tb create [name] [description]` - Add a new tally with a **required** name and _optional_ description.

`!tb add [name] [description]` - Same as above.

`!tb keyword [name] [keyword] [description]` - Every time the keyword is found, it will bump the tally automatically.

`!tb kw [name] [keyword] [description]` - Same as above.

`!tb describe [name] [description]` - Update a tally with a new description.

`!tb update [name] [description]` - Same as above. 

`!tb delete [name]` - Delete a tally.

`!tb rm [name]` - Same as above.

`!tb bump [name]` - Bump a tally's counter.

`!tb bump [name] [amount]` - Bump a tally a certain amount.

`!tb dump [name]` - ~~Decrease~~ Dump your tally one point!

`!tb dump [name] [amount]` - Dump a tally a certain amount.

### Admin

`!tb empty [name]` - Empty a tally, setting counter to 0.

`!tb set [name] [amount]` - set a tally to a specified amount

**note:** I have on my wishlist to write a permissions feature. These most likely will be admin-only once that is complete.

## Announcements
All announcement schedules are run in `America/Los_Angeles` timezone. I have plans to do channel specific timezones but it is low priority. Please schedule accordingly!

### General
`!tb announcements` - List all announcement created in this channel.

### Manage
`!tb announce [name] [description]` - Create a announcement with a required name and optional description. This can also be used to update the description of an existing announcement.

`!tb announce [name] -t [tally name] [tally goal]` - Set a specified tally amount in which to run the announcement.

`!tb announce [name] -d [date]` - Set a specified date for when to run the announcement. [See here for help](https://www.w3schools.com/js/js_date_formats.asp)

`!tb announce [name] -d [cron]` - Set a valid cron expression to run the announcement. [See here for help](https://crontab.guru/)

`!tb announce [name] -kill` - Stop an announcement from running.

`!tb announce [name] -delete` - Delete an announcement.

`!tb announce [name] -activate` - Start an announcement. 

## Timers
### General
`!tb timers` - List all timers created in this channel.

### Manage
`!tb timer [name] [description]` - Create a timer with a required name and optional description.

`!tb timer rm [name]` - Remove a timer

`!tb start [name]` - Start the timer.

`!tb stop [name]` - Stop the timer.

`!tb reset [name]` - Reset the timer to zero.



# Getting Started
## Starting
1. Install required dependancies with `npm i`
2. Duplicate `private-config.template.json` to file named `private-config.json`
3. Retrieve your bot's application token and insert it in the token property
4. Set your database properties, Tally Bot uses a mysql database
5. Start bot with `npm start`
6. If you would like to watch for changes, you can also run `npm run start-w` (_note_: requires `nodemon`)

## Commands
Command files are located in `./commands`. If you would like to add one you will need to follow these steps:
1. add new script file in commands directory
2. import script in `bot.ts` in the appropriate section, adding a short comment on what it does
3. initialize script by adding an event listener using the `emitter.on(prefix + command)` pattern

## Example config-private.json
```
{
    "token": "TOKEN_HERE",
    "database": {
        "url": "localhost",
        "user": "root",
        "password": ""
    }
}
```

# Frequent issues
## ER_NOT_SUPPORTED_AUTH_MODE
This occurs when using MySQL 8 with a user using no password. To fix, run the following command in your database.

`ALTER USER 'YOUR_USER'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'`

Then set your password to empty string.


