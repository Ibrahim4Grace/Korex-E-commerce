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

const productRegistrationMsg = async (newProduct, merchant) =>{
    const msg = `
    <p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
    <p>Dear ${merchant.merchantFirstName} ${merchant.merchantLastName},</p>

    <p>Congratulations! Your new product has been successfully added to Korex StyleHub.</p>
    <p>Customers can now discover and purchase your latest offering.</p>

    <p>If you have any questions or need further assistance, feel free to contact us at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. We're here to support you in maximizing your sales.</p>

    <p>Best regards,<br>
    Korex StyleHub</p>`;

    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: merchant.merchantEmail,
        subject: 'Your Product is Now on Korex StyleHub',
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


module.exports = { productRegistrationMsg};
