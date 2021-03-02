// dependencies
const express = require('express');
const morgan = require('morgan');

const middlewares = [morgan('dev'), express.json()];

module.exports = (app) => {
    middlewares.forEach((middleware) => {
        app.use(middleware);
    });
};
