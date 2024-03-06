const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const bcrypt = require('bcryptjs');

module.exports = () => {

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/google/callback",
    scope: ["profile", "email"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      // If user not found, create a new one
      if (!user) {
        user = new User({
          googleId: profile.id,
          customerFirstName: profile.displayName,
          customerLastName: profile.displayName,
          customerEmail: profile.emails ? profile.emails[0].value : '', // Check for emails availability
          // Set default or empty values for optional fields
          customerUsername: profile.username || '',
          customerAddress: profile.address || '',
          customerCity: profile.city || '',
          customerState: profile.state || '',
          customerCountry: profile.country || '',
          customerDob: profile.dob || '',
          customerNumber: profile.number || '',
          image: profile.photos ? profile.photos[0].value : '',
          role: 'User',


          // googleId: profile.id,
          // customerFirstName: profile.displayName,
          // customerLastName: profile.displayName,
          // customerEmail: profile.emails ? profile.emails[0].value : '',
          // // Other required fields - You may need to obtain these values from the user or the Google profile
          // customerPassword: '', // You can leave this empty if the user is authenticating via Google
          // customerUsername: '', // You may need to prompt the user for this value
          // customerAddress: '', // You may need to prompt the user for this value
          // customerCity: '', // You may need to prompt the user for this value
          // customerState: '', // You may need to prompt the user for this value
          // customerCountry: '', // You may need to prompt the user for this value
          // customerDob: '', // You may need to prompt the user for this value
          // customerNumber: '' // You may need to prompt the user for this value
        });
        await user.save();
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});


  return passport;

};
