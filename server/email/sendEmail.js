import transporter from './email.js';
import nodemailer from 'nodemailer';

export const Mail = async (to, subject, text, html) => {
    console.log(to);
  try {
      let info = await transporter.sendMail({
      from: '"Contractee" <legal@contractee.net>', // Sender address
      to: to, // List of receivers
      subject: subject, // Subject line
      text: text, // Plain text body
      html: html, // HTML body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Usage
// Mail(
//   'recipient@example.com', 
//   'Test Email', 
//   'This is a test email.', 
//   '<b>This is a test email.</b>'
// );

