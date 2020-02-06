# Changelog
All notable changes to this project will be documented in this file.

## 1.3
### Added
- Added direct message support for a number of commands. See [README.md](https://github.com/ryanpag3/discord-tally-bot/blob/master/README.md) for more details.
- Improved help command by adding navigation links
- Add up and downvote to bump and dump commands


### Fixed
- Fixed issue where show command would sort only by each page and not the whole query.

## **1.2.2**
### Added
- Added fix for global tallies not being triggered by global keywords
- Added the ability to dump on keyword
- Added command for resetting all tallies to 0
- Added command for deleting all tallies
- Added command for getting bot invite link
### Fixed
- Database code has been completely rewritten to improve performance.

## **1.2.1**
### Added
- Emoji's and foreign characters are now supported for descriptions! 📣📣📣📣‼‼‼‼‼
- You can now delete announcements.

### Fixed
- `!tb channel` no longer requires `-g` to be provided
- `!tb channel` will now properly set the tally to the channel that the command is run in
- Global and channel tally logic should be more predictable and have improved error messages.

## **1.2**
### Added
- **Global (a.k.a Server) Tallies** - you can now have globally scoped tallies. See [here](https://github.com/ryanpage42/discord-tally-bot/blob/master/README.md#scoping) for more information.

### Fixed
- Cleaned up some instances of inconsistent formatting.

## **1.1.1**
### Added
- **PERMISSIONS ARE HERE!** You can now manage user permissions for all bot commands. See [README.md](https://github.com/ryanpage42/discord-tally-bot/blob/master/README.md) for details.

### Fixed
- Creating a timer with `!tb timer` with no timer name provided will now properly throw an error.

## **1.1.0**
### Added
- Add support for announcements.
- Include new announcements commands in [README.md](https://github.com/ryanpage42/discord-tally-bot/blob/master/README.md) 
- Add changelog to begin tracking changes
- Began versioning scheme
- Add patch notes announcer to alert servers when a new patch has been deployed
- Add toggle command for new patch notes announce feature

### Changed
- Announcements can now be destroyed with an rmall command (dev only)
- Removed all instances of deprecated Sequelize API
- Explicitely label users who use bug report or suggest feature instead of tagging
