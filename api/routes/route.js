// routers
const authRouter = require('../routes/authRouter');

const routes = [
    {
        path: '/api/auth',
        router: authRouter,
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
            app.use(route.path, route.router);
        }
    });
};
