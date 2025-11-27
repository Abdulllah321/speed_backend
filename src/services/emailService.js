import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    this.from = process.env.SMTP_FROM || 'noreply@speedlimit.com';
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const info = await this.transporter.sendMail({ from: this.from, to, subject, html, text });
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email, firstName) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style></head>
      <body>
        <div class="container">
          <div class="header"><h1>Welcome!</h1></div>
          <div class="content">
            <p>Hello ${firstName},</p>
            <p>Your account has been created successfully. You can now login to access the system.</p>
            <p style="text-align: center;"><a href="${process.env.FRONTEND_URL}/login" class="button">Login Now</a></p>
          </div>
          <div class="footer"><p>&copy; ${new Date().getFullYear()} SpeedLimit. All rights reserved.</p></div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail({ to: email, subject: 'Welcome to SpeedLimit!', html });
  }

  async sendSecurityAlertEmail(email, alertType, details, firstName) {
    const alertMessages = {
      new_device: 'New device login detected',
      password_changed: 'Your password was changed',
      account_locked: 'Your account has been locked',
    };
    const html = `
      <!DOCTYPE html>
      <html>
      <head><style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .alert-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .details { background: #e5e7eb; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style></head>
      <body>
        <div class="container">
          <div class="header"><h1>🔒 Security Alert</h1></div>
          <div class="content">
            <p>Hello ${firstName},</p>
            <div class="alert-box"><strong>${alertMessages[alertType] || 'Security alert'}</strong></div>
            <div class="details">
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>IP Address:</strong> ${details.ipAddress || 'Unknown'}</p>
              <p><strong>Device:</strong> ${details.device || 'Unknown'}</p>
            </div>
            <p>If this wasn't you, please contact support immediately.</p>
          </div>
          <div class="footer"><p>&copy; ${new Date().getFullYear()} SpeedLimit. All rights reserved.</p></div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail({ to: email, subject: `Security Alert: ${alertMessages[alertType]}`, html });
  }
}

export default new EmailService();
