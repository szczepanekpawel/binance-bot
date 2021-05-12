/**
 * Options:
 * --algorithm=rsi --symbol=WAVES/USDT --interval=15m --amount=30 --instant=false
 * --algorithm=supertrend --symbol=WAVES/USDT --interval=15m --amount=30 --instant=false
 * --algorithm=sellmax --symbol=WAVES/USDT --interval=15m
 * --algorithm=sellmaxlist
 */

const cron = require('node-cron');
const {validate} = require('validate.js');
const {args, tasks} = require('./src/bootstrap');

if (tasks[args.algorithm]) {

    const validation = validate(args, tasks[args.algorithm]['params']);

    if (validation) {
        throw new Error(JSON.stringify(validation));
    }

    cron.schedule('* * * * *', async () => {
        try {
            await tasks[args.algorithm]['worker'].call();
        } catch (e) {
            console.error('Task error', e);
        }
    });

} else {
    console.log('unsupported algorithm');
}


