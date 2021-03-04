const yup = require('yup');

module.exports = yup.object().shape({
    status: yup.string().trim().min(5).max(100),
});
