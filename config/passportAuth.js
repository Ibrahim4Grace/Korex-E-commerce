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
        const hashedPassword = await bcrypt.hash('NA', 10); // Hash the default password 'NA'
        user = new User({
          googleId: profile.id,
          customerFirstName: profile.displayName,
          customerLastName: profile.displayName,
          customerEmail: profile.emails ? profile.emails[0].value : '', // Check for emails availability
          // Set default or empty values for optional fields
          customerUsername: profile.username || 'NA',
          customerAddress: profile.address || 'NA',
          customerCity: profile.city || 'NA',
          customerState: profile.state || 'NA',
          customerCountry: profile.country || 'NA',
          customerDob: profile.dob || 'NA',
          customerNumber: profile.number || 'NA',
          image: profile.photos ? profile.photos[0].value : '',
          customerPassword: hashedPassword // Set the hashed default password
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

