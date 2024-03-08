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
const statusMessages = {
    "string.empty": "CAC is required",
    "any.required": "CAC is required",
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
const dobMessages = {
    "string.empty": "Dob is required",
    "any.required": "Dob is required",
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

// Define a Joi schema for the user data
const merchantSchema = Joi.object({
    merchantLastName: Joi.string().min(2).required().messages(firstNameMessages),
    merchantLastName: Joi.string().min(2).required().messages(lastNameMessages),
    merchantEmail: Joi.string().email().required().messages(emailMessages),
    merchantPhone: Joi.string().pattern(/^\d+$/).min(5).required().messages(numberMessages),  
    merchantUsername: Joi.string().min(5).required().messages(usernameMessages),
    merchantcacStatus: Joi.string().min(2).required().messages(statusMessages),
    merchantAddress: Joi.string().min(2).required().messages(addressMessages),
    merchantCity: Joi.string().required().messages(cityMessages),
    merchantState: Joi.date().required().messages(stateMessages), 
    merchantCountry: Joi.string().required().messages(countryMessages), 
    merchantPassword: Joi.string().min(6).required().messages(passwordMessages),
    confirmMerchantPassword: Joi.string().valid(Joi.ref('merchantPassword')).required().messages(ConfirmPasswordMessages),
    role: Joi.string().valid('Merchant').required(),
});


 module.exports =  merchantSchema
