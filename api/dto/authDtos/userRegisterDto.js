const yup = require('yup');

module.exports = yup.object().shape({
    username: yup.string().trim().max(10).min(4).required(),
    email: yup.string().trim().email().required(),
    password: yup.string().min(6).required(),
});
