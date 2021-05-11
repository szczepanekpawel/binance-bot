const Stock = require("stock-technical-indicators")
const { Supertrend } = require("stock-technical-indicators/study/Supertrend");

const superTrendIndicator = async (client, coinSymbol, candlesPeriod) => {
    const candles = await client.candles({symbol: coinSymbol, interval: candlesPeriod, limit: 100});

    const candlesInXFormat = candles.map(v => {
        return [
            (new Date(v.openTime)).toISOString(),
            Number(v.open),
            Number(v.high),
            Number(v.low),
            Number(v.close),
            Number(v.volume)
        ];
    })

    const Indicator = Stock.Indicator;
    const newStudyATR = new Indicator(new Supertrend());

    const calculatedTrends = newStudyATR.calculate(candlesInXFormat, {period: 7, multiplier: 3});
    const previousCandle = calculatedTrends[calculatedTrends.length - 2]['Supertrend'].Direction;
    const lastCandle = calculatedTrends[calculatedTrends.length - 1]['Supertrend'].Direction;

    return {
        direction: lastCandle,
        directionChanged: lastCandle !== previousCandle
    }
}

module.exports = superTrendIndicator;
