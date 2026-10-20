const nodemailer = require('nodemailer');
const Setting = require('../models/Setting');

// Create reusable transporter
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test Ethereal account if no real credentials supplied
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Ethereal Test Mailer initialized with user:', testAccount.user);
    } catch (err) {
      console.warn('⚠️ Could not create Ethereal test account, fallback to console mailer:', err.message);
      transporter = {
        sendMail: async (options) => {
          console.log(' Simulated Email Sent To:', options.to);
          console.log(' Subject:', options.subject);
          return { messageId: 'simulated-' + Date.now(), previewUrl: null };
        }
      };
    }
  }

  return transporter;
};

/**
 * Send proactive email alert to store owner about expiring products
 */
const sendExpiryAlertEmail = async ({ toEmail, expiringProducts, criticalCount, totalRiskValue }) => {
  try {
    const mailer = await getTransporter();
    const recipient = toEmail || process.env.ALERT_EMAIL_TO || 'storeowner@xpiredstore.com';

    const productRows = expiringProducts.map((p) => {
      const days = p.daysRemaining !== undefined ? p.daysRemaining : 
        Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      const badgeColor = days <= 0 ? '#ef4444' : days <= 3 ? '#f97316' : '#eab308';
      const statusLabel = days <= 0 ? 'EXPIRED' : `${days} Day(s) Left`;

      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${p.name}</td>
          <td style="padding: 10px 12px; color: #475569; font-family: monospace;">${p.batchNumber}</td>
          <td style="padding: 10px 12px; color: #475569;">${p.category}</td>
          <td style="padding: 10px 12px; color: #1e293b; font-weight: 600;">
            📍 ${p.shelfLocation?.rack || 'Rack N/A'}, ${p.shelfLocation?.shelf || 'Shelf N/A'}
          </td>
          <td style="padding: 10px 12px; color: #475569;">${new Date(p.expiryDate).toLocaleDateString()}</td>
          <td style="padding: 10px 12px; text-align: center;">
            <span style="background-color: ${badgeColor}; color: white; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold;">
              ${statusLabel}
            </span>
          </td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #0f172a;">
            ${p.quantity} ${p.unit || 'units'} (₹${((p.costPrice || 0) * (p.quantity || 1)).toFixed(2)})
          </td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 24px; color: white;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">⏰ X-Pired: Expiry Alert</h1>
            <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">Action Required</span>
          </div>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">
            Immediate attention needed: <strong>${criticalCount} perishable item(s)</strong> are approaching expiry or expired!
          </p>
        </div>

        <div style="padding: 24px;">
          <!-- Financial summary banner -->
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #991b1b; font-weight: 600;">
              ⚠️ Potential Financial Loss at Risk: <span style="font-size: 16px; font-weight: 800;">₹${(totalRiskValue || 0).toFixed(2)}</span>
            </p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #b91c1c;">
              Apply Smart Clearance Discounts now to recover costs before items must be tossed out.
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: left; color: #475569;">
                <th style="padding: 10px 12px;">Product</th>
                <th style="padding: 10px 12px;">Batch</th>
                <th style="padding: 10px 12px;">Category</th>
                <th style="padding: 10px 12px;">Rack / Shelf</th>
                <th style="padding: 10px 12px;">Expiry</th>
                <th style="padding: 10px 12px; text-align: center;">Status</th>
                <th style="padding: 10px 12px; text-align: right;">Qty & Value</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>

          <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 14px;">Next Steps for Store Staff & Owner:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.6;">
              <li>Send staff to the specific <strong>Rack and Shelf locations</strong> identified above.</li>
              <li>Apply suggested <strong>Clearance Discounts (30% - 70%)</strong> to prompt customer purchase.</li>
              <li>Generate and print <strong>Promotional Clearance Posters</strong> for shelf displays.</li>
              <li>Pull fully expired products and log them into <strong>Secure Disposal History</strong>.</li>
            </ul>
          </div>

          <div style="text-align: center; padding-top: 10px;">
            <a href="http://localhost:5173" style="display: inline-block; background: #2563eb; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
              Open X-Pired Dashboard →
            </a>
          </div>
        </div>

        <div style="background: #f1f5f9; padding: 14px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
          Sent by <strong>X-Pired Proactive Expiry Monitoring System</strong> • Reducing store waste & saving money
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"X-Pired Alert System" <${process.env.SMTP_USER || 'no-reply@xpired.local'}>`,
      to: recipient,
      subject: `🚨 [URGENT] ${criticalCount} Product(s) Expiring Soon - X-Pired Alert`,
      html: htmlContent,
    };

    const info = await mailer.sendMail(mailOptions);
    console.log(`✅ Expiry alert email sent to ${recipient}: ${info.messageId}`);
    
    let previewUrl = null;
    if (nodemailer.getTestMessageUrl) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 Ethereal Preview URL: ${previewUrl}`);
      }
    }

    // Update last email sent timestamp
    await Setting.findOneAndUpdate({}, { lastEmailAlertSent: new Date() }, { upsert: true });

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('❌ Error sending email alert:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendExpiryAlertEmail };
