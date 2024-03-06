const mongoose = require(`mongoose`);
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    customerFirstName:{
        type: String,
    },
    customerLastName:{
        type: String,
    },
    customerEmail:{
        type: String,
    },
    customerUsername:{
        type: String,
    },
    customerAddress:{
        type: String,
    },
    customerCity:{
        type: String,
      
    },
    customerState:{
        type: String,
      
    },
    customerCountry:{
        type: String,
      
    },
    customerDob:{
        type: String,
        
    },
    customerNumber:{
        type: String,
       
    },
    image:{
        data: Buffer,
        contentType: String
    },
    customerPassword:{
        type: String,
       
    },
    role:{
        type: String,
    },
    googleId:{
        type: String,
    },
   Order: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }
   ],
   failedLoginAttempts: {   
    type: Number,
    default: 0 
  },
  accountLocked: { 
    type: Boolean, 
    default: false 
  },
  // for email verification
  isVerified: { 
    type: Boolean, 
    default: false
  },
  verificationToken: {
    token: {
        type: String,
    },
    expires: {
        type: Date,
    }
  },
  resetPasswordToken: {
    type: String,
    default: null
   },
   resetPasswordExpires: {
    type: Date,
    default: null
   },
  date_added: {
    type: Date,
    default: Date.now()
  },
   
});

userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpires = new Date(Date.now() + 20 * 60 * 1000); // Set to 20 minutes from now
    return resetToken;
};

const User = mongoose.model('User', userSchema);



module.exports =  User



