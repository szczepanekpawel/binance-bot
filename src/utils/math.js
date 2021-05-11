const percentChange = (originalPrice, newPrice) => {
    if (originalPrice === newPrice) {
        return 0;
    }

    return (((newPrice - originalPrice) / originalPrice) * 100).toFixed(2);
}

module.exports = { percentChange }
