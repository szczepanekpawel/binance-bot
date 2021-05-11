const args = require('minimist')((process.argv.slice(2)));
const log4js = require("log4js");
const fs = require('fs')

const registerExitHandler = require('./system/node-process');
const algorithms = require('./utils/algorithms');
const binanceClient = require('./utils/binance-client');
const buySellUsingRsi = require('./tasks/buySellUsingRsi');
const buySellUsingSuperTrend = require('./tasks/buySellUsingSupertrend');
const sellAtHighestPrice = require('./tasks/sellAtHighestPrice');
const sellAtHighestPriceMany = require('./tasks/sellAtHighestPriceMany');

const algorithm = args.algorithm;
const symbol = args.symbol ? args.symbol.split('/')[0] : undefined;
const currency = args.symbol ? args.symbol.split('/')[1] : undefined;
const defCurrency = 'USDT';
const interval = args.interval || '5m';
const amount = args.amount || 30;
const instantBuy = Boolean(args.instant);

let logFilename = `${algorithm}_${symbol}_${currency}_${interval}_${amount}`.toLowerCase();

if (algorithm === algorithms.SELL_MAX_LIST) {
    logFilename = `${algorithm}`.toLowerCase();
}

const logFilePath = `./logs/${logFilename}.log`;

if(fs.existsSync(logFilePath)) {
    fs.unlinkSync(logFilePath);
}

log4js.configure({
    appenders: {myFile: {type: "file", filename: `./logs/${logFilename}.log`}},
    categories: {default: {appenders: ['myFile'], level: "info"}}
});

log4js.getLogger().info('START LOGGER');

registerExitHandler(() => {
    log4js.shutdown();
})

module.exports = {
    args: {
        algorithm, symbol, currency, interval, amount, instantBuy
    },
    tasks: {
        [algorithms.TOP_BOTTOM_RSI]: buySellUsingRsi(binanceClient, log4js.getLogger(), {
            cryptoSymbol: symbol, currency: currency || defCurrency, interval: interval, amount: amount, buyOnDemand: instantBuy
        }),
        [algorithms.SUPERTREND]: buySellUsingSuperTrend(binanceClient, log4js.getLogger(), {
            cryptoSymbol: symbol, currency: currency || defCurrency, interval: interval, amount: amount, buyOnDemand: instantBuy
        }),
        [algorithms.SELL_MAX]: sellAtHighestPrice(binanceClient, log4js.getLogger(), {
            cryptoSymbol: symbol, currency: currency || defCurrency, interval: interval
        }),
        [algorithms.SELL_MAX_LIST]: sellAtHighestPriceMany(binanceClient, log4js.getLogger()),
    }
};
