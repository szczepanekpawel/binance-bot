const registerExitHandler = (handler) => {
    process
        .on('SIGINT', () => {
            handler();
            process.exit();
        })
        .on('SIGUSR1', () => {
            handler();
            process.exit();
        })
        .on('SIGUSR2', () => {
            handler();
            process.exit();
        })
        .on('uncaughtException', (err) => {
            console.error(err);
            handler();
            process.exit();
        })
        .on('unhandledRejection', (err) => {
            console.error(err);
            handler();
            process.exit();
        })
    ;
}

module.exports = registerExitHandler;
