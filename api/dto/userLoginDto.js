const yup = require('yup');

module.exports = yup.object().shape({
    email: yup.string().trim().email(),
    password: yup.string().min(6),
});
