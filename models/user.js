const mongoose = require(`mongoose`);
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    customerFirstName:{
        type: String,
        required: true
    },
    customerLastName:{
        type: String,
        required: true
    },
    customerEmail:{
        type: String,
        required: true
    },
    customerUsername:{
        type: String,
        required: true
    },
    customerAddress:{
        type: String,
        required: true
    },
    customerCity:{
        type: String,
        required: true
    },
    customerState:{
        type: String,
        required: true
    },
    customerCountry:{
        type: String,
        required: true
    },
    customerDob:{
        type: String,
        required: true
    },
    customerNumber:{
        type: String,
        required: true
    },
    image: {
        data:Buffer,
        contentType:String
       },
    customerPassword:{
        type: String,
        required: true
    },
    role:{
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
    this.resetPasswordExpires = new Date(Date.now() + 2 * 60 * 1000); // Set to 10 minutes from now
    return resetToken;
};

const User = mongoose.model('User', userSchema);



module.exports =  User



