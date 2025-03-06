import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL, // Your email
      pass: process.env.PASS, // Your app password
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    text,
  });
};
