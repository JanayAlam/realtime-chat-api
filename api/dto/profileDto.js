const yup = require('yup');

module.exports = yup.object().shape({
    name: yup.string().trim().max(25).min(3).required('Name field is required'),
    status: yup.string().trim().min(5).max(100),
});
