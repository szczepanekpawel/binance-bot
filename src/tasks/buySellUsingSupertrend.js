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
        options = {interval: '30m', amount: 50, buyOnDemand: false, ...options};

        const tradingSymbol = options.symbol.replace('/', '');
        const cryptoToken = options.symbol.split('/')[0]
        const currency = options.symbol.split('/')[1]

        if (typeof buyImmediately !== "boolean") {
            buyImmediately = options.buyOnDemand;
        }

        const trendIndicator = await superTrendIndicator(client, tradingSymbol, options.interval);

        if (buyImmediately || (trendIndicator.directionChanged && trendIndicator.direction === 1 && nextAction === BUY_ACTION)) {
            buyImmediately = false
            lastBuyPrice = await buyOrder(tradingSymbol, options.amount, logger);
            nextAction = SELL_ACTION;
        } else if (trendIndicator.directionChanged && trendIndicator.direction === -1 && nextAction === SELL_ACTION) {
            await sellAllOrder(cryptoToken, currency, logger);
            nextAction = BUY_ACTION;
        }
    }
}

module.exports = buySellUsingSuperTrend;
