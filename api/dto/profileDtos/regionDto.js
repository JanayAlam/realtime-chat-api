const yup = require('yup');

module.exports = yup.object().shape({
    region: yup.string(),
});
