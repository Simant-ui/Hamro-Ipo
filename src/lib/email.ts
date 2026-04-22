import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendIPOReminderEmail(
  to: string,
  companyName: string,
  symbol: string,
  openingDate: string,
  price: number
) {
  const mailOptions = {
    from: `"Hamro IPO" <${process.env.SMTP_USER}>`,
    to,
    subject: `🚀 IPO Reminder: ${companyName} is opening soon!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #10b981; margin-bottom: 20px;">IPO Opening Alert!</h2>
        <p>Namaste! This is a reminder from <strong>Hamro IPO</strong>.</p>
        <p>The following IPO that you were interested in is opening soon:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${companyName} (${symbol})</h3>
          <p><strong>Opening Date:</strong> ${openingDate}</p>
          <p><strong>Price per Share:</strong> Rs. ${price}</p>
        </div>
        
        <p>Don't forget to apply through your MeroShare account!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p>You received this email because you set a reminder on Hamro IPO.</p>
          <p>&copy; 2026 Hamro IPO. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
