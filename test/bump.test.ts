// import sinon from 'sinon';
// import CommandHandler from '../util/command-handler';
// import db from '../util/db';
// import Bluebird = require('bluebird');

// describe('bump command', function() {
    
//     const TALLY_NAME = 'test';
//     const commandHandler = new CommandHandler();
//     let fakeMessage;

//     before(() => {
//         // this.timeout(7000);
//         db.initTestDatabase();
//     });

//     beforeEach(async () => {
//         fakeMessage =  {
//             channel: {
//                 id: 1,
//                 send: sinon.fake()
//             },
//             guild: {
//                 id: 1
//             },
//             author: 'Ryan',
//             delete: sinon.fake()
//         };
//     });

//     this.afterEach(async () => {
//         // await db.Tally.truncate();
//     });

//     it('should run a test', async () => {
//         const command = `!tb bump`;
//         fakeMessage.content = command + ' ' + TALLY_NAME;
//         commandHandler.emit(command, fakeMessage);
//     });
// });