const express = require('express');

const app = express();

const http = require('http');

const server = http.createServer(app);

const port = 3001;

const logExports = require('./Logger');

app.use('/logs/export/csv', logExports);

/**
 * Event listener for HTTP server "error" event.
 */
const onError = async (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
    case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
    case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
    default:
        throw error;
    }
};

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    console.error(`Listening on ${bind}`);
};
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port).on('listening', onListening).on('error', onError);
