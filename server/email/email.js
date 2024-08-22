import nodemailer from 'nodemailer';

// Create a transporter
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Replace with your email provider's SMTP server
  port: 587, // Usually 587 for TLS, 465 for SSL
  secure: false, // Set to true if using port 465
  auth: {
    user: 'test2.auspicioussoft@gmail.com', // Replace with your email address
    pass: 'fronryayvocshlso', // Replace with your email password
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

export default transporter;