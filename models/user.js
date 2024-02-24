const mongoose = require(`mongoose`);
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
    type: String, 
  },
  date_added: {
    type: Date,
    default: Date.now()
  },
   
});


const User = mongoose.model('User', userSchema);

module.exports =  User

