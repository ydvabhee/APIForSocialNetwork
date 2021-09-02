const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = validateEducationInput = (data) => {

    const errors = {};
    data.school = !isEmpty(data.school) ? data.school : '';
    data.degree = !isEmpty(data.degree) ? data.degree : '';
    data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
    data.from = !isEmpty(data.from) ? data.from : '';
    data.to = !isEmpty(data.to) ? data.to : '';
    data.current = !isEmpty(data.current) ? data.current : '';
    data.description = !isEmpty(data.description) ? data.description : '';

    Validator.isEmpty(data.school) && (errors.school = 'School field is required.');
    Validator.isEmpty(data.degree) && (errors.degree = 'Degree field is required.');
    Validator.isEmpty(data.fieldofstudy) && (errors.fieldofstudy = 'FieldOfStudy field is required.');
    Validator.isEmpty(data.from) && (errors.from = 'from field is required.');
    Validator.isEmpty(data.to) && (errors.to = 'to field is required.');
    Validator.isEmpty(data.current) && (errors.current = 'current field is required.');
    Validator.isEmpty(data.description) && (errors.description = 'Description field is required.');

    (!Validator.isLength(data.description, {
        max: 500
    })) && (errors.education = 'Description must within 500 characters');

    return ({
        errors,
        isValid: isEmpty(errors)
    });

};