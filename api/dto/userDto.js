const yup = require('yup');

module.exports = yup.object().shape({
    username: yup.string().trim().max(10).min(4),
    email: yup.string().trim().email(),
    password: yup.string().min(6),
});
