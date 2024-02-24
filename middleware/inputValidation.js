const Joi = require('joi');

// Define a Joi schema for the user data
const userSchema = Joi.object({
    customerFirstName: Joi.string().min(2).required(),
    customerLastName: Joi.string().min(2).required(),
    customerEmail: Joi.string().email().lowercase().required(),
    customerUsername: Joi.string().min(5).required(),
    customerAddress: Joi.string().min(5).required(),
    customerCity: Joi.string().min(2).required(),
    customerState: Joi.string().min(2).required(),
    customerCountry: Joi.string().min(2).required(),
    customerDob: Joi.date().required(), 
    customerNumber: Joi.string().min(5).required(),
    // Password confirmation
    customerPassword: Joi.string().min(6).required(),
    customerPassword1: Joi.string().valid(Joi.ref('customerPassword'))
        .required()
        .messages({
            'any.only': 'Passwords must match',
            'any.required': 'Please confirm password'
        })
});

module.exports = { userSchema };


// customerUsername: Joi.string().min(5).regex(/^[a-zA-Z0-9@]+$/),

