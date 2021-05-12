const config = require('config');
const _ = require('lodash');
const {sellAllOrder} = require('./../utils/binance-api-domain');
const client = require('./../utils/binance-client');
const {percentChange} = require('./../utils/math');

let cachedData = {};

const sellAtHighestPriceMany = (binanceClient, logger) => {
    return async () => {
        const symbolListToMonitor = config.get('task.sellAtHighestPriceMany.symbols');

        for (const cryptoSymbolConf of symbolListToMonitor) {
            const cryptoSymbolString = cryptoSymbolConf.symbol;
            const startUpPrice = cryptoSymbolConf.price;
            const tradingStringPairs = cryptoSymbolString.replace('/', '');
            const cryptoSymbol = cryptoSymbolString.split('/')[0];
            const currency = cryptoSymbolString.split('/')[1];

            if (!cachedData[tradingStringPairs]) {
                cachedData[tradingStringPairs] = {
                    startUpPrice: startUpPrice > 0 ? startUpPrice : false,
                    topPrice: false,
                    sold: false
                };
            }

            if (cachedData[tradingStringPairs].sold === false) {
                logger.info(`watch for ${cryptoSymbolString}`);
                const candles = await client.candles({symbol: tradingStringPairs, interval: '15m', limit: 100});

                const candleStartPrice = Number(candles[candles.length - 1].open);
                const candleClosePrice = Number(candles[candles.length - 1].close);

                if (!cachedData[tradingStringPairs].startUpPrice) {
                    cachedData[tradingStringPairs].startUpPrice = candleStartPrice;
                }

                if (!cachedData[tradingStringPairs].topPrice) {
                    cachedData[tradingStringPairs].topPrice = cachedData[tradingStringPairs].startUpPrice;
                }

                if (candleClosePrice > candleStartPrice && candleClosePrice > cachedData[tradingStringPairs].topPrice) {
                    cachedData[tradingStringPairs].topPrice = candleClosePrice;
                }

                let startUpToTopPriceChange = percentChange(cachedData[tradingStringPairs].startUpPrice, cachedData[tradingStringPairs].topPrice);
                let currentPriceChange = percentChange(cachedData[tradingStringPairs].startUpPrice, candleClosePrice);

                logger.info(`startUpPrice ${cachedData[tradingStringPairs].startUpPrice}`);
                logger.info(`currentPriceChange ${currentPriceChange}`);
                logger.info(`topPrice ${cachedData[tradingStringPairs].topPrice}`);
                logger.info(`startUpPriceUpChange ${startUpToTopPriceChange}`);
                logger.info(`candleClosePrice ${candleClosePrice}`);

                console.log(`${cryptoSymbolString} price change of ${currentPriceChange}`);

                if (startUpToTopPriceChange >= 10) {
                    const topPriceDownChange = percentChange(cachedData[tradingStringPairs].topPrice, candleClosePrice);

                    if (topPriceDownChange < -2) {
                        logger.info(`selling at price ${candleClosePrice}`);
                        console.log(`selling ${tradingStringPairs}`);

                        try {
                            await sellAllOrder(cryptoSymbol, currency, logger);
                            cachedData[tradingStringPairs].sold = true;
                        } catch (e) {
                            logger.info(e);
                        }

                    }
                }
            }
        }

        logger.info('-------------------------------------------');
        console.log('-------------------------------------------');

        if (_.find(cachedData, (v) => v.sold === false) === undefined) {
            console.log('everything was sold, exiting');
            process.exit();
        }

    }
}

module.exports = sellAtHighestPriceMany;
