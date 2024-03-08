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
    <p>Dear  ${merchant.merchantFirstName} ${merchant.merchantLastName} ,  We are thrilled to welcome you to Korex StyleHub Service. </p>
      
    <p>Here are some important details to get you started:</p>
    <ul>
        <li>Full Name: ${merchant.merchantFirstName} ${merchant.merchantLastName}</li>
        <li>Email Address: ${merchant.merchantEmail}</li>
        <li>Phone Number: ${merchant.merchantPhone}</li>
        <li>Username: ${merchant.merchantUsername}</li>
        <li>Home Address: ${merchant.merchantAddress}</li>
        <li>City: ${merchant.merchantCity}</li>
        <li>State: ${merchant.merchantState}</li>
    </ul>
      
    <p>Thank you for registering with Korex StyleHub! We are delighted to welcome you to our platform</p>
      
    <p>Your account has been successfully created, you can now explore all the features we have to offer.</p>
      
    <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>
      
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

module.exports = { merchantRegistrationMsg,merchantVerifyEmailMsg};
