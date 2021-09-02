// validate experience input

const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = validateExperienceInput = (data) => {
    let errors = {};

    data.title = !isEmpty(data.title) ? data.title : '';
    data.company = !isEmpty(data.company) ? data.company : '';
    data.location = !isEmpty(data.location) ? data.location : '';
    data.description = !isEmpty(data.description) ? data.description : '';


    Validator.isEmpty(data.title) && (errors.title = 'Title field is required');
    Validator.isEmpty(data.company) && (errors.company = 'Company field is required');
    Validator.isEmpty(data.location) && (errors.location = 'Location field is required');

    if (!Validator.isEmpty(data.description)) {
        if (!Validator.isLength(data.description, {
                max: 500
            })) {
            errors.description = 'Max length of description  shuold be 500 characters';
        }
    }

    return ({
        errors,
        isValid: isEmpty(errors)
    });
};