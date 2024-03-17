const Joi = require('joi');

const firstNameMessages = {
    "string.empty": "Firstname is required",
    "string.min": "Firstname must be at least {#limit} characters",
    "any.required": "Firstname is required",
};
const lastNameMessages = {
    "string.empty": "Lastname is required",
    "string.min": "Lastname must be at least {#limit} characters",
    "any.required": "Lastname is required",
};
const emailMessages = {
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
    "any.required": "Email is required",
};
const usernameMessages = {
    "string.empty": "Username is required",
    "string.min": "Username must be at least {#limit} characters",
    "any.required": "Username is required",
};
const addressMessages = {
    "string.empty": "Address is required",
    "string.min": "Address must be at least {#limit} characters",
    "any.required": "Address is required",
};
const cityMessages = {
    "string.empty": "City is required",
    "string.min": "City must be at least {#limit} characters",
    "any.required": "City is required",
};
const stateMessages = {
    "string.empty": "State is required",
    "string.min": "State must be at least {#limit} characters",
    "any.required": "State is required",
};
const countryMessages = {
    "string.empty": "State is required",
    "any.required": "State is required",
};
const numberMessages = {
    "string.empty": "Phone number is required",
    'string.pattern.base': 'Phone number must contain only digits',
    "string.min": "Phone number must be at least {#limit} characters",
    "any.required": "Phone number is required",
};
const passwordMessages = {
    "string.empty": "Password is required",
    "string.min": "Password must be at least {#limit} characters",
    "any.required": "Password is required",
};
const ConfirmPasswordMessages = {
    "any.only": "Passwords must match",
    "string.empty": "Confirm password is required",
    "any.required": "Password is required",
    
};

const productNameMessages = {
    "string.empty": "Product name is required",
    "any.required": "Product name is required",
};
const productDescription = {
    "string.empty": "Product description name is required",
    "string.min": "Product description must be at least {#limit} characters",
    'string.max': 'Product description cannot exceed 250 characters',
    "any.required": "Product description name is required",
};
const productPrice = {
    'number.base': 'Product price must be a number',
    'number.min': 'Product must be greater than {#limit}',
    "any.required": "Product price name is required",
};
const productShippingMessages = {
    'number.base': 'Shipping price must be a number',
    'number.min': 'Shipping must be greater than {#limit}',
    "any.required": "Shipping price name is required",
};
const productCategoryMessages = {
    "string.empty": "Product category name is required",
    "any.required": "Product category name is required",
};
const productBrandMessages = {
    "string.empty": "Product brand name is required",
    "any.required": "Product brand name is required",
};
const productSizeMessages = {
    "string.empty": "Product size name is required",
    "any.required": "Product size name is required",
};
const productColorMessages = {
    "string.empty": "Product color name is required",
    "any.required": "Product color name is required",
};
const productQuantityMessages = {
    'number.base': 'Product quantity must be a number',
    'number.min': 'Product quantity be greater than {#limit}',
    "any.required": "Product quantity name is required",
};
const productImagesMessages = {
    "string.empty": "Product image is required",
    "any.required": "Product image is required",
};

// Define a Joi schema for the user data
const merchantSchema = Joi.object({
    merchantFirstName: Joi.string().min(2).required().messages(firstNameMessages),
    merchantLastName: Joi.string().min(2).required().messages(lastNameMessages),
    merchantEmail: Joi.string().email().required().messages(emailMessages),
    merchantPhone: Joi.string().pattern(/^\d+$/).min(5).required().messages(numberMessages),  
    merchantUsername: Joi.string().min(5).required().messages(usernameMessages),
    merchantAddress: Joi.string().min(2).required().messages(addressMessages),
    merchantCity: Joi.string().min(2).required().messages(cityMessages),
    merchantState: Joi.string().min(2).required().messages(stateMessages), 
    merchantCountry: Joi.string().required().messages(countryMessages), 
    merchantPassword: Joi.string().min(6).required().messages(passwordMessages),
    confirmMerchantPassword: Joi.string().valid(Joi.ref('merchantPassword')).required().messages(ConfirmPasswordMessages),
    role: Joi.string().valid('Merchant').required(),
});

// Define a Joi schema for the product data
const productSchema = Joi.object({
    productName: Joi.string().required().messages(productNameMessages),
    productDescription: Joi.string().min(2).max(250).required().messages(productDescription),
    productPrice: Joi.number().min(1).required().messages(productPrice),
    productShipping: Joi.number().min(1).required().messages(productShippingMessages),  
    productCategory: Joi.string().required().messages(productCategoryMessages),
    productBrand: Joi.string().required().messages(productBrandMessages),
    productSize: Joi.string().required().messages(productSizeMessages),
    productColor: Joi.string().required().messages(productColorMessages), 
    productQuantity: Joi.number().min(0).required().messages(productQuantityMessages), 
    productImages: Joi.string().min(6).required().messages(productImagesMessages),
   
});


 module.exports =  {merchantSchema, productSchema}
