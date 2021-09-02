// validate profile input data

const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = validateProfileInput = (data) => {
    let errors = {};
    data.handle = !isEmpty(data.handle) ? data.handle : '';
    data.skills = !isEmpty(data.skills) ? data.skills : '';
    data.status = !isEmpty(data.handle) ? data.status : '';

    Validator.isEmpty(data.status) && (errors.status = 'Status field is required');
    Validator.isEmpty(data.skills) && (errors.skills = 'Skills field is required');

    if (Validator.isEmpty(data.handle)) {
        errors.handle = 'Profile handle is required';
    } else if (!Validator.isLength(data.handle, {
            min: 2,
            max: 20
        })) {
        errors.handle = 'Profile handle must be between 2 and 20 characters';
    }

    if (!isEmpty(data.website)) {
        if (!Validator.isURL(data.website)) {
            errors.website = 'URL is not valid';
        }
    }

    if (!isEmpty(data.youtube)) {
        if (!Validator.isURL(data.youtube)) {
            errors.youtube = 'URL is not valid';
        }
    }

    if (!isEmpty(data.facebook)) {
        if (!Validator.isURL(data.facebook)) {
            errors.facebook = 'URL is not valid';
        }
    }

    if (!isEmpty(data.linkedin)) {
        if (!Validator.isURL(data.linkedin)) {
            errors.linkedin = 'URL is not valid';
        }
    }

    if (!isEmpty(data.instagram)) {
        if (!Validator.isURL(data.instagram)) {
            errors.instagram = 'URL is not valid';
        }
    }




    return ({
        errors,
        isValid: isEmpty(errors)
    });

};