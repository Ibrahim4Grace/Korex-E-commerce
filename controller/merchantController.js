'use strict';
const express = require(`express`)
const nodemailer = require(`nodemailer`);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/Admin');  
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const passport = require('../config/passportAuth')();
const User = require('../models/User');
const Merchant = require('../models/merchant');
const Product = require('../models/product');
const userSchema = require('../middleware/userValidation');
const productSchema = require('../middleware/productValidation');
const paginatedResults = require('../utils/pagination');
const {productRegistrationMsg} = require('../services/merchantProductMsgMailer');
// const {userRegistrationMsg,verifyEmailMsg,requestVerificationMsg,forgetPasswordMsg,resetPasswordMsg} = require('../services/userAuthMsgMailer');




                            //Merchant Landing page
const welcomeMerchant = async (req, res, next) => {
    try {
        const merchant = await Merchant.findById(req.user.id);
        if (!merchant) {
            return res.status(404).json({ success: false, errors: [{ msg: 'Merchant not found' }] });
        }

        res.render('merchant/index', { merchant });
    } catch (error) {
        next(error);
    }
};

// Merchant Uploading profile Image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!file.mimetype.startsWith('image')) {
            return cb(new Error('Only images are allowed'));
        }
        cb(null, './public/merchantImage/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now())
    }
});
const upload = multer({ storage: storage });

const uploadMerchantImage = async (req, res, next) => {
    try {
        // Handle the uploaded file
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Extract the user ID from the JWT token
        const merchant = await Merchant.findById(req.user.id);
        if (!merchant) {
            return res.status(404).json({ success: false, errors: [{ msg: 'Merchant not found' }] });
        }

        merchant.image = {
            data: fs.readFileSync(file.path), // Read file data
            contentType: file.mimetype, // Get file MIME type
        };
        await merchant.save();
        return res.status(200).json({ success: true, message: 'File uploaded successfully' });
    } catch (error) {
        next(error);
    }
};

            //   PRODUCT SECTION
const merchantProducts = async (req, res, next) => {
    try {
        const merchant = await Merchant.findById(req.user.id);
        if (!merchant) {
            return res.status(404).json({ success: false, errors: [{ msg: 'Merchant not found' }] });
        }

        // Accessing properties directly from res.paginatedResults
        const { results, currentPage, totalPages } = res.paginatedResults;

        res.render('merchant/products', { merchant, ourProducts: res.paginatedResults.results,currentPage, totalPages });
    } catch (error) {
        next(error);
    }
};

                                   // Merchant Uploading new product and Images
let stor = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/productImage/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now());
    },
});
// const upl = multer({ storage: stor });
const upl = multer({ storage: stor});


const merchantProductsPost = async (req, res, next) => {
try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No images uploaded' });
        }
                // Find the merchant who is posting the product
        const merchant = await Merchant.findById(req.user.id);
        if (!merchant) {
            return res.status(404).json({ success: false, errors: [{ msg: 'Merchant not found' }] });
        }
                  // Validate user input against Joi schema
        const productResult = await productSchema.validateAsync(req.body);

        //Save the user data to the database
        const images = req.files.map((file) => ({
          data: fs.readFileSync(path.join(__dirname, '../public/productImage/' + file.filename)),
          contentType: 'image/png',
        }));
       
             // Save the user data to the database
        const newProduct = new Product({
            productName: productResult.productName,
            productDescription: productResult.productDescription,
            productPrice: productResult.productPrice,
            productShipping: productResult.productShipping,
            productCategory: productResult.productCategory,
            productBrand: productResult.productBrand,
            productSize: productResult.productSize,
            productColor: productResult.productColor,
            productQuantity: productResult.productQuantity,
            images: images,
            MerchantId: merchant._id,
            date_added: Date.now(),
        });
        await newProduct.save();

            // After successfully product registering the merchant, call the email sending function
        await productRegistrationMsg(newProduct, merchant);

        console.log('Product successfully registered:', newProduct);
        res.status(201).json({ success: true ,  message: 'Product successfully registered' });
    }catch (error) {
        let errors; // Declare errors variable
        if (error.isJoi) {
                      // Joi validation error
            errors = error.details.map(err => ({
                key: err.path[0],
                msg: err.message
            }));
            console.error('Joi validation error:', errors);
            return res.status(400).json({ success: false, errors });

        } else {
            next(error);
        }
    }
};

//Merchant viewing product details 
const viewProduct = async (req, res, next) => {
    try {
        const merchant = await Merchant.findById(req.user.id);
        if (!merchant) {
            return res.status(404).json({ success: false, errors: [{ msg: 'Merchant not found' }] });
        }

        const productInfo = await Product.findOne({ _id: req.params.productId });
        if (!productInfo) {
            return res.status(404).json({ success: false, errors: [{ msg: 'Product information not found' }] });
        }

        res.status(201).json({ success: true , productInfo, merchant });
    } catch (error) {
        next(error);
    }
};

//Merchant edit product details 
const editProduct = async (req, res, next) => {
    try {
        const merchant = await Merchant.findById(req.user.id);
        if (!merchant) {
            return res.status(404).json({ success: false, errors: [{ msg: 'Merchant not found' }] });
        }

        const editProduct = await Product.findById(req.params.productId);
        if (!editProduct) {
            return res.status(404).json({ success: false, errors: [{ msg: 'Product information not found' }] });
        }

        res.status(201).json({ success: true , editProduct, merchant });
    } catch (error) {
        next(error);
    }
};

const editProductPost = async (req, res, next) => {
    try {
        const merchant = await Merchant.findById(req.user.id);
        if (!merchant) {
            return res.status(404).json({ success: false, errors: [{ msg: 'Merchant not found' }] });
        }
         // Ensure that productInfo is a valid MongoDB ObjectId
        const productInfo = mongoose.Types.ObjectId(req.params.productId);

        const { productName, productDescription, productPrice, productShipping, productCategory, productBrand, productSize, productColor, productQuantity,productInStock,productLowStock,productOutOfStock } = req.body;

         // Update the product document
        await Product.findByIdAndUpdate(productInfo, {
            $set: {
                productName,
                productDescription,
                productPrice,
                productShipping,
                productCategory,
                productBrand,
                productSize,
                productColor,
                productQuantity,
                productInStock,
                productLowStock,
                productOutOfStock,
                MerchantId: merchant._id,
            }
        });

        console.log('Product successfully updated:');
        // Send success response to the client
        res.status(201).json({ success: true, message: 'Product successfully updated' });
    } catch (error) {
        next(error);
    }
};


const deleteProduct = async (req, res, next) => {
    try {
        // Check if the merchant exists and has permission to delete products
        const merchant = await Merchant.findById(req.user.id);
        if (!merchant) {
            return res.status(404).json({ success: false, errors: [{ msg: 'Merchant not found' }] });
        }

        const productInfo = await Product.findById(req.params.productId);
        if (!productInfo) {
            return res.status(404).json({ success: false, errors: [{ msg: 'Product information not found' }] });
        }

        // Delete the product
        await Product.findByIdAndDelete(req.params.productId);
        
        console.log('Product deleted successfully:');
        
        res.status(201).json({ success: true , productInfo, merchant, message: 'Product deleted successfully'  });
    } catch (error) {
        next(error);
    }
};



const merchantOrders = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.user.id);

        if (!merchant) {
            return res.status(404).send('Merchant not found');
        }

        res.render('merchant/orders', { merchant });
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).send('Error retrieving merchant information');
    }
};

const merchantReviews = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.user.id);

        if (!merchant) {
            return res.status(404).send('Merchant not found');
        }

        res.render('merchant/reviews', { merchant });
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).send('Error retrieving merchant information');
    }
};

const merchantCustomerMsg = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.user.id);

        if (!merchant) {
            return res.status(404).send('Merchant not found');
        }

        res.render('merchant/customerMsg', { merchant });
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).send('Error retrieving merchant information');
    }
};

const merchantSettings = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.user.id);

        if (!merchant) {
            return res.status(404).send('Merchant not found');
        }

        res.render('merchant/settings', { merchant });
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).send('Error retrieving merchant information');
    }
};


// Define the logout route
const merchantLogout = (req, res) => {
  // Clear cookies containing access token and refresh token
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  // Optionally, clear any session data or perform other cleanup tasks

  // Respond with a success message
  res.status(200).json({ success: true, message: 'Logout successful' });
};




module.exports = ({ welcomeMerchant,upload,uploadMerchantImage,merchantProducts,upl,merchantProductsPost,viewProduct,editProduct,editProductPost,deleteProduct,merchantOrders,merchantReviews,merchantCustomerMsg,merchantSettings,merchantLogout});
