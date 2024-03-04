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
    "string.empty": "userName is required",
    "string.min": "userName must be at least {#limit} characters",
    "any.required": "userName is required",
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
    "string.empty": "Number is required",
    "string.min": "Number must be at least {#limit} characters",
    "any.required": "Number is required",
};
const passwordMessages = {
    "string.empty": "Password is required",
    "string.min": "Password must be at least {#limit} characters",
    "any.required": "Password is required",
};

// Define a Joi schema for the user data
const userSchema = Joi.object({
    customerFirstName: Joi.string().min(2).required().messages(firstNameMessages),
    customerLastName: Joi.string().min(2).required().messages(lastNameMessages),
    customerEmail: Joi.string().email().required().messages(emailMessages),
    customerUsername: Joi.string().min(5).required().messages(usernameMessages),
    customerAddress: Joi.string().min(5).required().messages(addressMessages),
    customerCity: Joi.string().min(2).required().messages(cityMessages),
    customerState: Joi.string().min(2).required().messages(stateMessages),
    customerCountry: Joi.string().required().messages(countryMessages),
    customerDob: Joi.date().required().messages(dobMessages), 
    customerNumber: Joi.string().min(5).required().messages(numberMessages), 
    customerPassword: Joi.string().min(6).required().messages(passwordMessages),
    customerPassword1: Joi.ref('customerPassword'),
    role: Joi.string().valid('User').required(),
    // image: Joi.object({
    //     data: Joi.binary().optional(),
    //     contentType: Joi.string().optional()
    // }).optional()
});


 module.exports =  userSchema


