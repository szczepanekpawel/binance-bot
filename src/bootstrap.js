const args = require('minimist')((process.argv.slice(2)));
const log4js = require("log4js");
const fs = require('fs');

const registerExitHandler = require('./system/node-process');
const algorithms = require('./utils/algorithms');
const binanceClient = require('./utils/binance-client');
const {buySellUsingRsi, constraints} = require('./tasks/buySellUsingRsi');
const buySellUsingSuperTrend = require('./tasks/buySellUsingSupertrend');
const sellAtHighestPrice = require('./tasks/sellAtHighestPrice');
const sellAtHighestPriceMany = require('./tasks/sellAtHighestPriceMany');

let logFilename = Object.values(args).join('_').replace('/', '_').toLowerCase();
const logFilePath = `./logs/${logFilename}.log`;

if (fs.existsSync(logFilePath)) {
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
    args,
    tasks: {
        [algorithms.TOP_BOTTOM_RSI]: {
            worker: buySellUsingRsi(binanceClient, log4js.getLogger(), args),
            params: {
                symbol: { presence: true, type: 'string' },
                interval: { presence: false, type: 'string' },
                amount: { presence: false, type: 'integer' },
                buyOnDemand: { presence: false, type: 'boolean' },
            }
        },
        [algorithms.SUPERTREND]: {
            worker: buySellUsingSuperTrend(binanceClient, log4js.getLogger(), args),
            params: {
                symbol: { presence: true, type: 'string' },
                interval: { presence: false, type: 'string' },
                amount: { presence: false, type: 'integer' },
                buyOnDemand: { presence: false, type: 'boolean' },
            }

        },
        [algorithms.SELL_MAX]: {
            worker: sellAtHighestPrice(binanceClient, log4js.getLogger(), args),
            params: {
                symbol: { presence: true, type: 'string' },
                interval: { presence: false, type: 'string' },
            }

        },
        [algorithms.SELL_MAX_LIST]: {
            worker: sellAtHighestPriceMany(binanceClient, log4js.getLogger()),
            params: {}
        },
    }
}
