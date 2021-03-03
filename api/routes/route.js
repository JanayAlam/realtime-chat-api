// routers
const authRouter = require('./authRouter');
const profileRouter = require('./profileRouter');

const routes = [
    {
        path: '/auth',
        router: authRouter,
    },
    {
        path: '/profiles',
        router: profileRouter,
    },
    {
        path: '/api',
        router: (req, res, next) => {
            res.json({
                message: 'Hello from the router js file',
            });
        },
    },
];

module.exports = (app) => {
    routes.forEach((route) => {
        if (route.path === '/api') {
            app.get(route.path, route.router);
        } else {
            app.use('/api' + route.path, route.router);
        }
    });
};
