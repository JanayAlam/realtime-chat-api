const yup = require('yup');

module.exports = yup.object().shape({
    gender: yup.string(),
});
