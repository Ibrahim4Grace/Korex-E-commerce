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

// Function to send password reset email to users
const userRegistrationMsg = async (newUser,verificationLink) => {
      // Email content for unverified user
      const unverifiedMsg = `
      <p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
      <p>Dear ${newUser.customerFirstName} ${newUser.customerLastName}, welcome to Korex StyleHub Service.</p>
      <p>Please click <a href="${verificationLink}">here</a> to verify your email address.</p>
      <p>If you didn't register, please ignore this email.</p>
      <p>Best regards, <br> The Korex StyleHub Team</p>`;

  // Configure email options
  const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: newUser.customerEmail,
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

const verifyEmailMsg = async (user) => {
    const verifiedMsg = `
    <p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
    <p>Dear  ${user.customerFirstName} ${user.customerLastName} ,  We are thrilled to welcome you to Korex StyleHub Service. </p>
      
    <p>Here are some important details to get you started:</p>
    <ul>
        <li>Full Name: ${user.customerFirstName} ${user.customerLastName}</li>
        <li>Email Address: ${user.customerEmail}</li>
        <li>Phone Number: ${user.customerNumber}</li>
        <li>Username: ${user.customerUsername}</li>
        <li>Home Address: ${user.customerAddress}</li>
        <li>City: ${user.customerCity}</li>
        <li>State: ${user.customerState}</li>
    </ul>
      
    <p>Thank you for registering with Korex StyleHub! We are delighted to welcome you to our platform</p>
      
    <p>Your account has been successfully created, you can now explore all the features we have to offer.</p>
      
    <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>
      
    <p>Best regards,<br>
    The Korex StyleHub Team</p>`;
    
        // Send the second email for verified users
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: user.customerEmail,
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

const requestVerificationMsg = async (user,verificationLink) => {
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: user.customerEmail,
        subject: 'Verify Your Email - Korex StyleHub',
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

const forgetPasswordMsg = async (user,resetLink) => {
    const msg = `
    <p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
    <p>Dear ${user.customerFirstName} ${user.customerLastName},</p>

    <p>We are writing to confirm your password recovery with Korex StyleHub.</p>
    <p>Reset your password here: <a href="${resetLink}">Click here to reset your password</a></p>

    <p>If you didn't request this verification, please ignore this email.</p>

    <p>If you encounter any issues or need further assistance, feel free to contact our support team at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>

    <p>Warm regards,<br>
    Korex StyleHub</p>`;

    const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: user.customerEmail,
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

const resetPasswordMsg = async (user) =>{
    const msg = `
    <p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
    <p>Dear ${user.customerFirstName} ${user.customerLastName},</p>

    <p>We are writing to confirm your password recovery with Korex StyleHub.</p>
    <p>Your password has been successfully reset. You can now log in to your account using your new password.</p>

    <p>If you did not request this password reset, please contact us immediately. at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>

    <p>Warm regards,<br>
    Korex StyleHub</p>
`;

const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: user.customerEmail,
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


module.exports = { userRegistrationMsg,verifyEmailMsg,requestVerificationMsg,forgetPasswordMsg,resetPasswordMsg};
