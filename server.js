// application
const express = require('express');
const app = express();

// dot env and configuration dependencies
require('dotenv').config();
const config = require('config');

// constant variables
const DB_URL = `mongodb+srv://${config.get('db-username')}:${config.get(
    'db-password'
)}@cluster0.8ez2y.mongodb.net/${config.get(
    'db-name'
)}?retryWrites=true&w=majority`;

// third party dependencies
const chalk = require('chalk');

// routes
const setRoutes = require('./api/routes/route');
app.use(express.json());
setRoutes(app);

// database
const mongoose = require('mongoose');

// errors
const apiErrorHandler = require('./api/errors/errorHandler');
app.use(apiErrorHandler);

// middlewares
const setMiddleware = require('./api/middlewares/middlewares');
setMiddleware(app);

// serving the application
const PORT = process.env.PORT || 8080;

mongoose
    .connect(DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(chalk.green(`Visit: http://localhost:${PORT}`));
        });
    })
    .catch((e) => {
        console.log(chalk.red(`Could not serve the application`));
        console.log(e);
    });
