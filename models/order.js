
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    businessAddress:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    userId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
   image: {
    data:Buffer,
    contentType:String
   },
   date_added:{
    type:Date,
    default:Date.now()
   }

})


const Order = mongoose.model('Order', orderSchema);

module.exports =  Order

