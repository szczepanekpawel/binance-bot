const binanceClient = require('./binance-client');
const _ = require('lodash');

const getSymbolData = async (tradingSymbol) => {
    const exchangeInfo = await binanceClient.exchangeInfo();
    return exchangeInfo.symbols.filter((v) => v.symbol === tradingSymbol).pop();
};

const buyOrder = async (symbol, amount, logger) => {
    logger.info(`buying ${symbol} for ${amount} `);
    const orderResult = await binanceClient.order({symbol, side: 'buy', type: 'MARKET', quoteOrderQty: amount});
    logger.info(`buying results: ${JSON.stringify(orderResult)}`);

    return Number(orderResult.fills[0].price);
};

const sellAllOrder = async (assetName, currency, logger) => {
    logger.info(`sell all amount for ${assetName}`);

    //get current asset amount
    const accountInfo = await binanceClient.accountInfo();
    const tradingSymbol = assetName + currency;

    if (accountInfo.balances) {
        logger.info(`try to get account balance for ${assetName}`);

        const asset = accountInfo.balances.filter(v => v.asset === assetName.toUpperCase()).pop();
        let assetAmount = Number(asset.free);

        logger.info(`you have ${assetAmount} of ${assetName}`);

        //get LOT_SIZE
        const symbolData = await getSymbolData(tradingSymbol);
        const stepSize = symbolData.filters.filter(v => v.filterType === 'LOT_SIZE').pop().stepSize;
        let minimalSell = symbolData.filters.filter(v => v.filterType === 'MIN_NOTIONAL').pop().minNotional;
        minimalSell = Number(minimalSell);

        if (stepSize < 1) {
            const lotPrecision = stepSize.indexOf(1) - 1;
            assetAmount = _.floor(assetAmount, lotPrecision);
        } else if (Number(stepSize) === 1) {
            assetAmount = _.floor(assetAmount);
        }

        if (assetAmount < minimalSell) {
            logger.info(`too low amount for ${tradingSymbol}. You've got ${assetAmount} of minimum ${minimalSell}`);
            throw new Error('to low asset amount');
        } else {
            const sellData = {
                symbol: tradingSymbol, side: 'sell', type: 'MARKET', quantity: assetAmount
            };

            logger.info(`selling ${tradingSymbol} for ${assetAmount}`);

            const orderResult = await binanceClient.order(sellData);

            logger.info(`sell results response: ${JSON.stringify(orderResult)}`);
        }
    }
};

module.exports = {buyOrder, sellAllOrder};
