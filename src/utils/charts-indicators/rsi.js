const RSI = require('technicalindicators').RSI;

const calculateRSI = async (client, coinSymbol, candlesPeriod) => {
    const close = [];
    const candles = await client.candles({symbol: coinSymbol, interval: candlesPeriod, limit: 100});

    for (const candle of candles) {
        close.push(candle.close);
    }

    return {
        rsi: RSI.calculate({values: close, period: 14}).pop(),
        lastCandle: candles.pop()
    };
}

module.exports = calculateRSI;
