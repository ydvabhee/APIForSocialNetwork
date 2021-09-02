const express = require("express");
const router = express.Router();
const passport = require("passport");
// const mongoose = require("mongoose");

// Load profile model
const Profile = require("../../model/Profile");
// Load user model
const User = require("../../model/User");
// required input valdation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');




// @route   GET api/test
// desc     testing
// access   public
router.get("/test", (req, res) =>
  res.json({
    msg: "profile works",
  })
);


// @route   GET api/profile/all
// desc     GET all profiles
// access   public

router.get("/all", (req, res) => {
  const errors = {};

  Profile.find().populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.profiles = 'there is no profiles'
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch(err => res.status(404).json({
      profile: 'there is no profiles'
    }));

});


// @route   GET api/profile/handle :handle
// desc     get profile by handle
// access   public

router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Profile.findOne({
      handle: req.params.handle
    }).populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.profile = 'there is no profile for this user';
        return res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json({
      profile: 'there is no profile for this user'
    }));

});

// @route   GET api/profile/user:user_id
// desc     get profile by user id
// access   public

router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.profile = 'there is no profile for this user';
        return res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json({
      profile: 'there is no profile for this user'
    }));

});





// @route   GET api/profile
// desc     routing to current user profile
// access   private

router.get("/",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    let errors = {};
    Profile.findOne({
        user: req.user.id,
      }).populate('user', ['name', 'avatar'])
      .then((profile) => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user.";
          return res.status(404).json(errors);
        }

        return res.json(profile);
      })
      .catch((err) => res.status(400).json(err));
  }
);



// @route   Post api/profile
// desc     creating or updating profile
// access   private

router.post("/", passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    //input validation
    const {
      errors,
      isValid
    } = validateProfileInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Get fields
    let profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;
    // Skills - Split into arrays
    if (typeof req.body.skills !== "undifined") {
      profileFields.skills = req.body.skills.split(',');
    }
    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;



    // Check if handle exist
    Profile.findOne({
      handle: req.body.handle
    }).then((profile) => {

      if (profile.user != req.user.id) {
        errors.handle = "handle already exists";
        return res.status(400).json(errors);
      }
    });

    Profile.findOne({
      user: req.user.id,
    }).then((profie) => {
      if (profie) {
        // Update
        Profile.findOneAndUpdate({
          user: req.user.id
        }, {
          $set: profileFields
        }, {
          new: true
        }).then((profile) => res.json(profile));
      } else {
        // Create


        // Save profile
        new Profile(profileFields).save().then((profile) => res.json(profile));
      }
    });
  }
);


// @route   Post api/profile/experience
// desc     creating or updating experience
// access   private

router.post('/experience', passport.authenticate('jwt', {
  session: false
}), (req, res) => {

  // Validating inputs
  const {
    errors,
    isValid
  } = validateExperienceInput(req.body)
  if (!isValid) {
    return res.status(400).json({
      errors
    });
  }

  //finding profile
  Profile.findOne({
    user: req.user.id
  }).then(profile => {
    if (!profile) {
      errors.profile = 'there is no profile for this user';
      return res.status(404).json(errors);
    }

    //  create new experience object
    const newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description,
    };

    // Adding a new experience at first or at 0th index
    profile.experience.unshift(newExp);

    //save profile
    profile.save().then(profile => res.json(profile));



  })


});



// @route   DELETE api/profile/experience/delete:exp_id
// desc     Deleting experience
// access   private

router.delete('/experience/:exp_id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  let errors = {};

  Profile.findOne({
      user: req.user.id
    })
    .then(profile => {
      if (!profile) {
        errors.profie = 'there is no profile for this user';
        return res.status(404).json(errors);
      }

      const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
      profile.experience.splice(removeIndex, 1);
      profile.save().then(profie => res.json(profile));

    })


});



// @route   Post api/profile/education
// desc    adding education details
// access   private

router.post('/education', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const {
    errors,
    isValid
  } = validateEducationInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Profile.findOne({
      user: req.user.id
    })
    .then(profile => {
      if (!profile) {
        errors.profile = 'there is no profile of this user';
        return res.status(404).json(errors);
      }

      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }

      profile.education.unshift(newEdu);
      profile.save().then(profile => {
        return res.json(profile)
      });
    })
    .catch(err => console.log(err));

});

// @route   DELETE api/profile/education/delete:edu_id
// desc    deleting education details
// access   private

router.delete('/education/:edu_id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const errors = {};

  Profile.findOne({
    user: req.user.id
  }).then(profile => {
    if (!profile) {
      errors.profile = 'there is no profile for this user';
      return res.status(400).json(errors);
    }
    // get Index of education by educationId
    const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

    // Splice eduation array
    profile.education.splice(removeIndex, 1);

    //Save profile and return updated profile
    profile.save().then(profile => res.json(profile)).catch(err => console.log(err));

  })

});


// @route   DELETE api/profile
// desc    delete profile and user'd details
// access   private

router.delete('/', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const errors = {};
  Profile.findOneAndDelete({
      user: req.user.id
    })
    .then(profile => {
      if (!profile) {
        errors.profile = 'profile does not exist ';
        return res.status(404).json(errors);
      }

      User.findOneAndDelete({
          _id: req.user.id
        })
        .then(user => {
          if (!user) {
            errors.user = 'user does not exist';
            return res.status(404).json(errors);
          }

          res.json({
            success: true
          })
        })
        .catch(err => console.log(err));
    }).catch(err => console.log(err));
});



module.exports = router;