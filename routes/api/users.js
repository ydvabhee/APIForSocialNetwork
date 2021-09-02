const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const keys = require("../../config/keys");
const jwt = require("jsonwebtoken");
const passport = require("passport");

// Load Login and Register Validation
const validateRegisterInput = require("../../validation/registration");
const validateLoginInput = require('../../validation/login');
const isEmpty = require("../../validation/is-empty");


// Load User Model
const User = require("../../model/User");

// @route       GET api/users/test
// @desk        Test user route
// @access      Public

router.get("/test", (req, res) =>
  res.json({
    msg: "user works",
  })
);

// @route       GET api/user/register
// @desk        register a user
// @access      Public
router.post("/register", (req, res) => {
  //Register Validation
  const {
    errors,
    isValid
  } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(404).json(errors);
  }
  // User id already in db?
  User.findOne({
    email: req.body.email,
  }).then((user) => {
    if (user) {
      errors.email = "User already exist";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", // Size
        r: "pg", // Rating
        d: "mm", // Default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        avatar,
      });

      // Encrypting user's password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});


// @route       GET api/user/login
// @desk        user login or JWT jsonWebToken
// @access      Public

router.post("/login", (req, res) => {

  //validate login Input
  const {
    errors,
    isValid
  } = validateLoginInput(req.body);
  if (!isValid) {

    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;
  //find email is database
  User.findOne({
    email,
  }).then((user) => {
    // if email(user) not in database return error with message
    if (!user) {
      errors.email = "user not found";
      return res.status(404).json(errors);
    }
    // if user email in database compare passwords
    bcrypt.compare(password, user.password).then((isMatch) => {
      //if password match genarate JWTokens
      if (isMatch) {
        // create payload
        const payload = {
          name: user.name,
          id: user.id,
          avatar: user.avatar,
        };
        // create sign token
        jwt.sign(
          payload,
          keys.secretKey, {
            expiresIn: 3600,
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      }
      // if password doesn't match return error with message 'password doesn't match'
      else {
        return res.status(400).json({
          password: "password does not match",
        });
      }
    });
  });
});

// @route       GET api/user/current
// @desk        authenticating user
// @access      private

router.get(
  "/current",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
  }
);

module.exports = router;