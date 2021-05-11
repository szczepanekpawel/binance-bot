const calculateRSI = require('./../utils/charts-indicators/rsi');
const { buyOrder, sellAllOrder} = require('./../utils/binance-api-domain');
const client = require('./../utils/binance-client');

const BUY_ACTION = 'buy';
const SELL_ACTION = 'sell';

let nextAction = BUY_ACTION;
let lastBuyPrice
let buyImmediately;

const buySellUsingRsi = (binanceClient, logger, options) => {
    return async () => {
        if (!options.cryptoSymbol || !options.currency || !options.interval || !options.amount || typeof options.buyOnDemand !== "boolean") {
            throw new Error('Invalid buySellUsingRsi arguments');
        }

        const tradingSymbol = options.cryptoSymbol + options.currency;
        const {rsi, lastCandle} = await calculateRSI(client, tradingSymbol, options.interval);

        if (typeof buyImmediately !== "boolean") {
            buyImmediately = options.buyOnDemand;
        }

        if (buyImmediately || (rsi < 35 && nextAction === BUY_ACTION)) {
            logger.info(`rsi is below 35 - buying`);
            buyImmediately = false
            lastBuyPrice = await buyOrder(tradingSymbol, options.amount, logger);
            nextAction = SELL_ACTION;
        } else if (rsi > 65 && nextAction === SELL_ACTION && Number(lastCandle.close) > Number(lastBuyPrice)) {
            logger.info(`rsi is above 65 - selling`);
            await sellAllOrder(options.cryptoSymbol, options.currency, options.amount, logger);
            nextAction = BUY_ACTION;
        } else {
            logger.info(`rsi is ${rsi}, doing nothing`);
        }
    }
};

module.exports = buySellUsingRsi;
