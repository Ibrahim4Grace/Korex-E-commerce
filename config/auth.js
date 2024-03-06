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
        const hashedPassword = await bcrypt.hash(profile.Password, 10);
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
          customerPassword: hashedPassword || '',
          image: profile.photos ? profile.photos[0].value : '',
          role: 'User',
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
