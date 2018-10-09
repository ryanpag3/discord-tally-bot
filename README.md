# [TallyBot](https://discordbots.org/bot/494241511714586634)
**Tally Bot** is a small utility bot for keeping counts of stuff over long periods of time. Tallies are kept track of using a tally ID which you specify when you create it, as well as an optional description. 

# Commands
Cases where `[]` is shown should be replaced in its entirety with the value it represents. (i.e `!tb add my-tally` or `!tb rm my-tally`)

## Basic

`!tb` - This is the prefix. All commands should lead with this followed by a space. For example: `!tb show`

`!tb help` - Get a list of commands.

`!tb show` - List all tallies created in this channel.

`!tb details [name]` - Get details of a tally.

`!tb get [name]` - Same as above.

## Manage

`!tb create [name] [description]` - Add a new tally with a **required** name and _optional_ description.

`!tb add [name] [description]` - Same as above.

`!tb describe [name] [description]` - Update a tally with a new description.

`!tb update [name] [description]` - Same as above. 

`!tb delete [name]` - Delete a tally.

`!tb rm [name]` - Same as above.

`!tb bump [name]` - Bump a tally's counter.

`!tb dump [name]` - ~~Decrease~~ Dump your tally one point!

## Admin

`!tb empty [name]` - Empty a tally, setting counter to 0.

`!tb set [name] [amount]` - set a tally to a specified amount

**note:** I have on my wishlist to write a permissions feature. These most likely will be admin-only once that is complete.

# Getting Started
## Starting
1. Install required dependancies with `npm i`
2. Duplicate `private-config.template.json` to file named `private-config.json`
3. Retrieve your bot's application token and insert it in the token property
4. Set your database properties, Tally Bot uses a mysql database
5. Start bot with `npm start`
6. If you would like to watch for changes, you can also run `npm start-w` (_note_: requires `nodemon`)

## Commands
Command files are located in `./commands`. If you would like to add one you will need to follow these steps:
1. add new script file in commands directory
2. import script in `bot.ts` in the appropriate section, adding a short comment on what it does
3. initialize script by adding an event listener using the `emitter.on(prefix + command)` pattern


