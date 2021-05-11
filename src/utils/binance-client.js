const config = require('config');
const Binance = require('binance-api-node').default;

const binanceClient = Binance({
    apiKey: config.get('binance.keys.apiKey'),
    apiSecret: config.get('binance.keys.secretKey'),
});

module.exports = binanceClient;
