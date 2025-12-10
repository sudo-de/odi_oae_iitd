import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

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
  }

  async sendOtpEmail(to: string, otp: string, name?: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || '"OAE at IIT Delhi"<noreply@gmail.com>',
        to: to,
        subject: 'Password Reset OTP - OAE at IIT Delhi',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);">
                    <tr>
                      <td style="padding: 40px 32px; text-align: center;">
                        <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Password Reset</h1>
                        <p style="margin: 0 0 32px 0; font-size: 16px; color: #666666;">
                          ${name ? `Hi ${name},` : 'Hi,'}<br>
                          Use the code below to reset your password.
                        </p>
                        
                        <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 0 0 32px 0;">
                          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">Your verification code</p>
                          <p style="margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a;">${otp}</p>
                        </div>
                        
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #999999;">
                          This code expires in 10 minutes.
                        </p>
                        <p style="margin: 0; font-size: 14px; color: #999999;">
                          If you didn't request this, please ignore this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 24px 32px; background-color: #f8f9fa; border-radius: 0 0 16px 16px; text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #999999;">
                          © ${new Date().getFullYear()} OAE at IIT Delhi. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `Your password reset OTP is: ${otp}. This code expires in 10 minutes.`,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`[EmailService] OTP email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('[EmailService] Error sending email:', error);
      return false;
    }
  }

  async sendBackupNotification(
    to: string,
    name: string,
    backupInfo: {
      filename?: string;
      collections?: {
        users?: number;
        rideLocations?: number;
        rideBills?: number;
      };
    }
  ): Promise<boolean> {
    try {
      console.log(`[EmailService] Attempting to send backup notification to: ${to}`);

      const mailOptions = {
        from: process.env.SMTP_FROM || '"OAE at IIT Delhi"<noreply@gmail.com>',
        to: to,
        subject: 'Backup Completed - OAE at IIT Delhi',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);">
                    <tr>
                      <td style="padding: 40px 32px; text-align: center;">
                        <div style="width: 48px; height: 48px; background-color: #10b981; border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center;">
                          <span style="font-size: 24px;">💾</span>
                        </div>
                        <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Backup Completed</h1>
                        <p style="margin: 0 0 32px 0; font-size: 16px; color: #666666;">
                          Hi ${name},<br>
                          Your system backup has been completed successfully.
                        </p>

                        <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 0 0 32px 0;">
                          <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">Backup Details</h3>
                          <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #374151;">Users:</td>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280;">${backupInfo.collections?.users || 0}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #374151;">Routes:</td>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280;">${backupInfo.collections?.rideLocations || 0}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #374151;">Bills:</td>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280;">${backupInfo.collections?.rideBills || 0}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; font-weight: 500; color: #374151;">Total Records:</td>
                              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${(backupInfo.collections?.users || 0) + (backupInfo.collections?.rideLocations || 0) + (backupInfo.collections?.rideBills || 0)}</td>
                            </tr>
                          </table>
                        </div>

                        <p style="margin: 0; font-size: 14px; color: #666666;">
                          Backup file: <code style="background: #f3f4f6; padding: 2px 4px; border-radius: 4px;">${backupInfo.filename || 'N/A'}</code>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 24px 32px; background-color: #f8f9fa; border-radius: 0 0 16px 16px; text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #999999;">
                          © ${new Date().getFullYear()} OAE at IIT Delhi. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `Backup completed successfully. ${backupInfo.collections?.users || 0} users, ${backupInfo.collections?.rideLocations || 0} routes, ${backupInfo.collections?.rideBills || 0} bills backed up.`,
      };

      console.log(`[EmailService] Sending mail with options:`, {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`[EmailService] Mail sent successfully to ${to}, messageId:`, result.messageId);
      return true;
    } catch (error) {
      console.error('[EmailService] Error sending backup notification to', to, ':', error.message);
      console.error('[EmailService] Full error:', error);
      return false;
    }
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

