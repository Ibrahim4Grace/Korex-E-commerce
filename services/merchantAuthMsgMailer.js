const nodemailer = require(`nodemailer`);
require('dotenv').config(); // Load environment variables

// Send email to the applicant
const transporter = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
});

const phoneNumber = process.env.COMPANY_NUMBER;
const emailAddress = process.env.COMPANY_EMAIL;

// Registration email to merchant
const merchantRegistrationMsg = async (newMerchant,verificationLink) => {
    // Email content for unverified merchant
    const unverifiedMsg = `
    <p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
    <p>Dear ${newMerchant.merchantFirstName} ${newMerchant.merchantLastName}, welcome to Korex StyleHub Market Service.</p>
    <p>Please click <a href="${verificationLink}">here</a> to verify your email address.</p>
    <p>If you didn't register, please ignore this email.</p>
    <p>Best regards, <br> The Korex StyleHub Team</p>`;

    // Configure email options
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: newMerchant.merchantEmail,
        subject: 'Welcome to Korex StyleHub!',
        html: unverifiedMsg,
        attachments: [
            {
                filename: 'companyLogo.jpg',
                path: './public/img/companyLogo.jpg',
                cid: 'companyLogo'
            }
        ]
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email sending error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });

};

// Verify email to merchant
const merchantVerifyEmailMsg = async (merchant) => {
    const verifiedMsg = `
    <p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
    <p>Dear  ${merchant.merchantFirstName} ${merchant.merchantLastName} ,  Welcome to Korex StyleHub Service! We are thrilled to have you join us. </p>
      
    <p>Here are the details you provided during registration:</p>
    <ul>
        <li>Full Name: ${merchant.merchantFirstName} ${merchant.merchantLastName}</li>
        <li>Email Address: ${merchant.merchantEmail}</li>
        <li>Phone Number: ${merchant.merchantPhone}</li>
        <li>Username: ${merchant.merchantUsername}</li>
        <li>Home Address: ${merchant.merchantAddress}</li>
        <li>City: ${merchant.merchantCity}</li>
        <li>State: ${merchant.merchantState}</li>
    </ul>
      
    <p>Thank you for choosing Korex StyleHub! Your account has been successfully created, granting you access to our platform's exciting features</p>
      
    <p>Should you have any inquiries or require assistance, please don't hesitate to contact our support team at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>.Your satisfaction is our priority, and we are committed to providing you with the assistance you need.</p>
      
    <p>Best regards,<br>
    The Korex StyleHub Team</p>`;
    
        // Send the second email for verified users
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: merchant.merchantEmail,
        subject: 'Welcome to Korex StyleHub!',
        html: verifiedMsg,
        attachments: [
            {
                filename: 'companyLogo.jpg',
                path: './public/img/companyLogo.jpg',
                cid: 'companyLogo'
            }
        ]
    };
    
    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.log('Email sending error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });

};

const merchantRequestVerifyMsg = async (merchant,verificationLink) => {
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: merchant.merchantEmail,
        subject: 'Merchant Verify Your Email - Korex StyleHub',
        html: `<p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
        <p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>
        <p>Best regards,<br>
        The Korex StyleHub Team</p>`,
        attachments: [
            {
                filename: 'companyLogo.jpg',
                path: './public/img/companyLogo.jpg',
                cid: 'companyLogo'
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email sending error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

const merchantForgetPswdMsg = async (merchant,resetLink) => {
    const msg = `
    <p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
    <p>Dear ${merchant.merchantFirstName} ${merchant.merchantLastName},</p>

    <p>We are writing to confirm your password recovery with Korex StyleHub.</p>
    <p>Reset your password here: <a href="${resetLink}">Click here to reset your password</a></p>

    <p>If you didn't request this verification, please ignore this email.</p>

    <p>If you encounter any issues or need further assistance, feel free to contact our support team at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>

    <p>Warm regards,<br>
    Korex StyleHub</p>`;

    const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: merchant.merchantEmail,
    subject: 'Recover your password with Korex StyleHub!',
    html: msg,
    attachments: [
        {
            filename: 'companyLogo.jpg',
            path: './public/img/companyLogo.jpg',
            cid: 'companyLogo'
        }
    ]
};

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email sending error:', error);
            return res.status(500).json({ success: false, errors: [{ msg: 'Error sending email' }] });
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

const merchantResetPswdMsg = async (merchant) =>{
    const msg = `
    <p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
    <p>Dear ${merchant.merchantFirstName} ${merchant.merchantLastName},</p>

    <p>We are writing to confirm your password recovery with Korex StyleHub.</p>
    <p>Your password has been successfully reset. You can now log in to your account using your new password.</p>

    <p>If you did not request this password reset, please contact us immediately. at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>

    <p>Warm regards,<br>
    Korex StyleHub</p>`;

    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: merchant.merchantEmail,
        subject: 'Password Reset Successful with Korex StyleHub!',
        html: msg,
        attachments: [
            {
                filename: 'companyLogo.jpg',
                path: './public/img/companyLogo.jpg',
                cid: 'companyLogo'
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email sending error:', error);
            return res.status(500).json({ success: false, errors: [{ msg: 'Error sending email' }] });
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = { merchantRegistrationMsg,merchantVerifyEmailMsg,merchantRequestVerifyMsg,merchantForgetPswdMsg,merchantResetPswdMsg};
