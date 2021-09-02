// ALl the rules for registration

const Validator = require("validator");
const isEmpty = require("./is-empty");

const validateRegisterInput = (data) => {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password1 = !isEmpty(data.password1) ? data.password1 : '';

  if (Validator.isEmpty(data.name)) {
    errors.name = 'Name field is required';
  } else if (!Validator.isLength(data.name, {
      min: 2,
      max: 30,
    })) {
    errors.name = "Name must be between 2 and 30 Characters";
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = 'Email field is required';
  } else if (!Validator.isEmail(data.email)) {
    errors.email = 'Email is invalid';
  }



  if (Validator.isEmpty(data.password)) {
    errors.password = 'Password field is required';
  } else if (!Validator.isLength(data.password, {
      min: 6,
      max: 30
    })) {
    errors.password = 'Password must be between 6 and 30 characters';
  }
  if (Validator.isEmpty(data.password1) ||data.password1=='') {
    errors.password1 = 'Confirm password field is required';
  }


  if (!Validator.equals(data.password, data.password1)) {
    errors.password1 = 'passwords does not match';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

module.exports = validateRegisterInput;