const Joi = require('joi');

const passwordMessages = {
    "string.empty": "Password is required",
    "string.min": "Password must be at least {#limit} characters",
    "any.required": "Password is required",
};

const resetPasswordSchema = Joi.object({
    customerPassword: Joi.string().min(6).required().messages(passwordMessages),
    customerNewPassword1: Joi.ref('customerPassword')
});

 module.exports = resetPasswordSchema


