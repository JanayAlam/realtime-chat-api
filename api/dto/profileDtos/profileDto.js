const yup = require('yup');

module.exports = yup.object().shape({
    name: yup.string().trim().max(25).min(3).required('Name field is required'),
    status: yup.string().trim().notRequired(),
    gender: yup.string().trim().required('Gender field is required'),
    region: yup.string().trim().required('Region field is required'),
    dateOfBirth: yup.date().required('Date of birth is required'),
});
