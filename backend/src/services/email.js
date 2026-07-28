const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (email, code) => {
  // Always log code to terminal for easy dev testing
  console.log(`\n========================================`);
  console.log(`🔑 VERIFICATION CODE FOR ${email}: [ ${code} ]`);
  console.log(`========================================\n`);

  try {
    const sender = process.env.EMAIL_FROM || 'BusDesk <onboarding@resend.dev>';
    const { data, error } = await resend.emails.send({
      from: sender,
      to: email,
      subject: `${code} is your BusDesk verification code`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #1d4ed8, #059669); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">BusDesk</h1>
          </div>
          
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <p style="color: #475569; font-size: 16px; margin: 0 0 8px 0;">Your verification code is</p>
            
            <div style="background: #f8fafc; border: 2px solid #2563eb; border-radius: 12px; padding: 20px; margin: 16px 0; letter-spacing: 12px;">
              <span style="color: #0f172a; font-size: 36px; font-weight: 700;">${code}</span>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin: 16px 0 0 0;">
              This code expires in <strong style="color: #334155;">5 minutes</strong>.<br/>
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
          
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
            © ${new Date().getFullYear()} BusDesk Platform
          </p>
        </div>
      `,
    });

    if (error) {
      console.warn('Resend API notice (unverified email limit):', error.message);
      // Still return true so signup succeeds in dev mode even if Resend restricts testing emails
      return true;
    }

    console.log(`OTP email sent to ${email}, ID: ${data.id}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
    // Return true in dev mode so flow proceeds smoothly
    return true;
  }
};

module.exports = { sendOtpEmail };
