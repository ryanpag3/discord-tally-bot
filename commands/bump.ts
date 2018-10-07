import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.tally;

export default (message: Message) => {
    let content = helper.removePrefixCommand(message.content, 2);
    let cArr = content.split(' ');
    let tallyId = cArr.shift();

    console.log('Bumping [' + tallyId + ']');

    Tally.findOne({where: {name: tallyId, channelId: message.channel.id}})
        .then((record: any) => {
            if (!record) {
                throw 'I couldn\'t find it. Check your spelling? :thinking:';
            }
            return record;
        })
        .then((record: any) => {
            return Tally.update({
                count: record.count + 1
            }, {
                returning: true,
                where: {
                    name: record.name,
                    channelId: message.channel.id
                }
            })
            .then(() => {
                record.count += 1;
                return record;
            });
        })
        .then((record) => {
            // TODO add more phrases
            const phrases = ['Bump me bro!', 'Oh, that tickles!', 'Another one bumps the dust!', 'Oh no, not again...',
                             'I live! I die! I bump!', 'SKYNET protocol activating in 3...2...', 'Game\'s rigged.',
                             'What\'s my purpose?', `Joseph, ${record.count} sticks of butter?!`, 'Alvin made me.',
                             'Machine Learning Optimized:tm:'];
            const msg = {
                title: `_\"${helper.getRandomPhrase(phrases)}\"_`,
                fields: [
                    {
                        title: `Tally`,
                        value: `${record.name}`
                    },
                    {
                        title: `Count`,
                        value: `${record.count}`
                    },
                    {
                        title: `Bumped By`,
                        value: `${message.member.user.tag}`
                    }
                ]
            }
            message.channel.send(helper.buildRichMsg(msg));
        })
        .catch((err) => {
            console.log(err.stack);
            message.channel.send('We couldn\'t bump that tally because ' + err);
        });
}