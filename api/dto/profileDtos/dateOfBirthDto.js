const yup = require('yup');

module.exports = yup.object().shape({
    dateOfBirth: yup.date(),
});
