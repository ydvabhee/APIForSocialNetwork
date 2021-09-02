const Validator = require('validator');
const isEmpty = require('./is-empty');
const {
    default: validator
} = require('validator');


const validatePostInput = (data) => {
    const errors = {};
    data.text = !isEmpty(data.text) ? data.text : '';

    if (Validator.isEmpty(data.text)) {
        errors.text = 'text is required';
    } else if (!Validator.isLength(data.text, {
            min: 10,
            max: 500
        })) {
        errors.text = 'text must be between 10 and 500 characters';
    }

    return ({
        errors,
        isValid: isEmpty(errors)
    })
};

module.exports = validatePostInput;