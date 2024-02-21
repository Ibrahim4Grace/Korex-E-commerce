
const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
    merchantName:{
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
    merchantPassword:{
        type:String,
        required:true
    },
    businessAddress:{
        type:String,
        required:true
    },
    city:{
        type: String,
        required: true
    },
    state:{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    },
   image: {
    data:Buffer,
    contentType:String
   },
   date_added:{
    type:Date,
    default:Date.now()
   }

})


const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports =  Merchant

