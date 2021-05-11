const superTrendIndicator = require('./../utils/charts-indicators/supertrend');
const {buyOrder, sellAllOrder} = require('./../utils/binance-api-domain');
const client = require('./../utils/binance-client');

const BUY_ACTION = 'buy';
const SELL_ACTION = 'sell';

let nextAction = BUY_ACTION;
let lastBuyPrice
let buyImmediately;

const buySellUsingSuperTrend = (binanceClient, logger, options) => {
    return async () => {
        if (!options.cryptoSymbol || !options.currency || !options.interval || !options.amount || typeof options.buyOnDemand !== "boolean") {
            throw new Error('Invalid buySellUsingSuperTrend arguments');
        }

        if (typeof buyImmediately !== "boolean") {
            buyImmediately = options.buyOnDemand;
        }

        const tradingSymbol = options.cryptoSymbol + options.currency;
        const trendIndicator = await superTrendIndicator(client, tradingSymbol, options.interval);

        if (buyImmediately || (trendIndicator.directionChanged && trendIndicator.direction === 1 && nextAction === BUY_ACTION)) {
            buyImmediately = false
            lastBuyPrice = await buyOrder(tradingSymbol, options.amount, logger);
            nextAction = SELL_ACTION;
        } else if (trendIndicator.directionChanged && trendIndicator.direction === -1 && nextAction === SELL_ACTION) {
            await sellAllOrder(options.cryptoSymbol, options.currency, options.amount, logger);
            nextAction = BUY_ACTION;
        }
    }
}

module.exports = buySellUsingSuperTrend;
