 
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    productName:{
        type:String,
        required:true
    },
    productDescription:{
        type:String,
        required:true
    },
    productPrice:{
        type:Number,
        required:true
    },
    productShipping:{
        type:Number,
        required:true
    },
    productCategory:{
        type:String,
        required:true
    },
    productBrand:{
        type:String,
        required:true
    },
    productSize:{
        type: [String],
        required:true
    },
    productColor:{
        type: [String],
        required:true
    },
    productQuantity:{
        type:String,
        required:true
    },
    productInStock:{
        type:String,
    },
    productLowStock:{
        type:String,
    },
    productOutOfStock:{
        type:String,
    },
    images:{
        data:Buffer,
        contentType:String
    },
    MerchantId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Merchant'
        }
    ],
    date_added:{
        type:Date,
        default:Date.now()
    }

})

const Product = mongoose.model('Product', productSchema);

module.exports =  Product


