/**
 * Options:
 * --algorithm=rsi --symbol=WAVES/USDT --interval=15m --amount=30 --instant=false
 * --algorithm=supertrend --symbol=WAVES/USDT --interval=15m --amount=30 --instant=false
 * --algorithm=sellmax --symbol=WAVES/USDT --interval=15m
 * --algorithm=sellmaxlist
 */

const cron = require('node-cron');
const {args, tasks} = require('./src/bootstrap');

cron.schedule('* * * * *', async () => {
    if (tasks[args.algorithm]) {
        try {
            await tasks[args.algorithm].call();
        } catch (e) {
            console.error('Task error', e);
        }
    } else {
        console.log('unsupported algorithm');
    }
});
