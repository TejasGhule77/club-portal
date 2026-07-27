import nodemailer from 'nodemailer';

export async function sendOtpEmail(email, otp) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log(`[OTP] Generated OTP for ${email}: ${otp}`);

  if (!host || !user || !pass) {
    console.log('SMTP settings not fully configured in env. Skipping real email send.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: port == 465,
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: `"College Club Portal" <${user}>`,
    to: email,
    subject: 'Password Reset OTP - College Club Portal',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #2563eb; text-align: center;">College Club Portal</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your account. Please use the following 6-digit One-Time Password (OTP) to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; background: #f3f4f6; padding: 12px 24px; border-radius: 8px; border: 1px solid #e5e7eb; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color: #dc2626; font-weight: 500;">Note: This OTP is valid for 5 minutes and can only be used once.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">College Club Portal &copy; 2026</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email via nodemailer:', error);
  }
}
