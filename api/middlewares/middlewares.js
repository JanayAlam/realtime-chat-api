// dependencies
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const corsOptions = {
    origin: 'http://localhost:3000/',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const middlewares = [
    morgan('dev'),
    express.static('public'),
    express.json(), cors(corsOptions)
];

module.exports = (app) => {
    middlewares.forEach((middleware) => {
        app.use(middleware);
    });
};
