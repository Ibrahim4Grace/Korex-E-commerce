const mongoose = require('mongoose');
const crypto = require('crypto');

const merchantSchema = new mongoose.Schema({

    merchantFirstName:{
        type:String,
        required:true
    },
    merchantLastName:{
        type:String,
        required:true
    },
    merchantEmail:{
        type:String,
        required:true
    },
    merchantPhone:{
        type:String,
        required:true
    },
    merchantUsername:{
        type:String,
        required:true
    },
    merchantAddress:{
        type:String,
        required:true
    },
    merchantCity:{
        type: String,
        required: true
    },
    merchantState:{
        type: String,
        required: true
    },
    merchantCountry:{
        type: String,
        required: true
    },
    merchantPassword:{
        type:String,
        required:true
    },
    role:{
        type: String,
        required: 'Merchant'
    },
    image: {
        data:Buffer,
        contentType:String
    },
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
    date_added:{
        type:Date,
        default:Date.now()
    }

})

merchantSchema.methods.getResetPasswordTokens = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpires = new Date(Date.now() + 20 * 60 * 1000); // Set to 20 minutes from now
    return resetToken;
};

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports =  Merchant






  
 
 
