const Joi = require('joi');



const productNameMessages = {
    "string.empty": "Product name is required",
    "any.required": "Product name is required",
};
const productDescriptionMessages = {
    "string.empty": "Product description name is required",
    "string.min": "Product description must be at least {#limit} characters",
    'string.max': 'Product description cannot exceed 250 characters',
    "any.required": "Product description name is required",
};
const productPriceMessages = {
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
const imagesMessages = {
    "string.empty": "Product image is required",
    "any.required": "Product image is required",
};



// Define a Joi schema for the product data
const productSchema = Joi.object({
    productName: Joi.string().required().messages(productNameMessages),
    productDescription: Joi.string().min(1).max(250).required().messages(productDescriptionMessages),
    productPrice: Joi.number().min(1).required().messages(productPriceMessages),
    productShipping: Joi.number().min(1).required().messages(productShippingMessages),  
    productCategory: Joi.string().required().messages(productCategoryMessages),
    productBrand: Joi.string().required().messages(productBrandMessages),
    productSize: Joi.array().required().messages(productSizeMessages),
    productColor: Joi.array().required().messages(productColorMessages), 
    productQuantity: Joi.number().min(0).required().messages(productQuantityMessages), 
    productInStock: Joi.string().optional(),
    productLowStock: Joi.string().optional(),
    productOutOfStock: Joi.string().optional()
   
});


module.exports =  productSchema;

