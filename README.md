# TallyBot 
**Tally Bot** is a small utility bot for keeping counts of stuff over long periods of time. Tallies are kept track of using a tally ID which you specify when you create it, as well as an optional description. 

# Commands
Cases where `[]` is shown should be replaced in its entirety with the value it represents. (i.e `!tb add my-tally This is a tally!` or `!tb rm my-tally`)

`!tb` - This is the prefix. All commands should lead with this followed by a space. For example: `!tb show`

`!tb show` - List all tallies created in this channel.

`!tb create [ID] [Description]` - Add a new tally with a **required** ID and _optional_ description.

`!tb add [ID] [Description]`

`!tb delete [ID]` - Delete a tally.

`!tb rm [ID]`

`!tb bump [ID]` - Bump a tally's counter.

`!tb dump [ID]` - ~~Decrease~~ Dump your tally one point!

`!tb empty [ID]` - Empty a tally, setting counter to 0.


