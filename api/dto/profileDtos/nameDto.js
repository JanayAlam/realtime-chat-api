const yup = require('yup');

module.exports = yup.object().shape({
    name: yup.string().trim().max(25).min(3),
});
