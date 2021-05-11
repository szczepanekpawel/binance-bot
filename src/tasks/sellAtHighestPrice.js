const {sellAllOrder} = require('./../utils/binance-api-domain');
const client = require('./../utils/binance-client');
const {percentChange} = require('./../utils/math');

let startUpPrice = false;
let topPrice = false;

const sellAtHighestPrice = (binanceClient, logger, options) => {
    return async () => {
        if (!options.cryptoSymbol || !options.currency || !options.interval) {
            throw new Error('Invalid sellAtHighestPrice arguments');
        }

        const tradingSymbol = options.cryptoSymbol + options.currency;
        const candles = await client.candles({symbol: tradingSymbol, interval: options.interval, limit: 100});

        const candleStartPrice = Number(candles[candles.length - 1].open);
        const candleClosePrice = Number(candles[candles.length - 1].close);

        if (!startUpPrice) {
            startUpPrice = candleStartPrice;
        }

        if (candleClosePrice > candleStartPrice) {
            topPrice = candleClosePrice;
        } else {
            topPrice = startUpPrice;
        }

        let startUpPriceUpChange = percentChange(startUpPrice, candleClosePrice);

        if (startUpPriceUpChange >= 10) {
            const topPriceDownChange = percentChange(topPrice, candleClosePrice);

            if (topPriceDownChange < -2) {
                console.log('selling all');
                await sellAllOrder(options.cryptoSymbol, options.currency, logger);
                process.exit();
            }
        }
    }
}



module.exports = sellAtHighestPrice;
