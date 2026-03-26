// Falling Waters Day Spa - Contact Form Handler
// Sends notification email to business + auto-reply to lead via SendGrid

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SITE_EMAIL = process.env.SITE_EMAIL || 'Spa@tacfitness.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'leads@gullstack.com';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

function isGibberish(text) {
  if (!text || text.length < 2) return false;
  const cleaned = text.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length < 2) return false;
  const vowels = cleaned.match(/[aeiou]/g);
  if (!vowels || vowels.length < cleaned.length * 0.15) return true;
  if (/[^aeiou]{5,}/i.test(cleaned)) return true;
  return false;
}

function looksLikeSpam(data) {
  const { firstName, fax_number, _timestamp, email, message } = data;
  if (fax_number) return 'honeypot';
  if (_timestamp) {
    const elapsed = Date.now() - parseInt(_timestamp, 10);
    if (elapsed < 3000) return 'too_fast';
  }
  const name = [firstName, data.lastName].filter(Boolean).join(' ');
  if (isGibberish(name)) return 'gibberish_name';
  if (name && /[_|<>{}[\]\\\/~`^]/.test(name)) return 'suspicious_name_chars';

  if (email) {
    const localPart = email.split('@')[0];
    if (isGibberish(localPart)) return 'gibberish_email';
    const disposable = /@(mailinator|guerrillamail|tempmail|throwaway|yopmail|sharklasers|grr\.la|dispostable|maildrop)\./i;
    if (disposable.test(email)) return 'disposable_email';
  }

  if (message) {
    const spamPatterns = /\b(viagra|casino|crypto|bitcoin|lottery|prize|winner|click here|buy now|free money|seo services|backlink|link building)\b/i;
    if (spamPatterns.test(message)) return 'spam_content';
    const urls = message.match(/https?:\/\/[^\s)]+/g) || [];
    const externalUrls = urls.filter(u => !u.includes('fallingwatersdayspa.com'));
    if (externalUrls.length > 0) return 'external_url';
  }

  return false;
}

async function sendEmail({ to, from, fromName, subject, html, replyTo, cc }) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }], ...(cc ? { cc: [{ email: cc }] } : {}) }],
      from: { email: from, name: fromName || 'Falling Waters Day Spa' },
      reply_to: replyTo ? { email: replyTo } : undefined,
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  return response.ok;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { firstName, lastName, email, phone, procedure, contactMethod, message, fax_number, _timestamp } = req.body;

    const spamReason = looksLikeSpam({ firstName, lastName, fax_number, _timestamp, email, message });
    if (spamReason) {
      console.log(`[SPAM BLOCKED] reason=${spamReason} name="${firstName} ${lastName}" email="${email}"`);
      return res.status(200).json({ success: true });
    }

    if (!firstName || !email) {
      return res.status(400).json({ error: 'First name and email are required' });
    }

    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    const leadData = {
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      interest: procedure || null,
      message: message?.trim() || null,
      source: 'fallingwatersdayspa.com',
      status: 'new',
      email_sent: false,
      created_at: new Date().toISOString(),
    };

    // Store in Supabase if configured
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(leadData),
        });
      } catch (e) {
        console.error('Supabase insert error:', e);
      }
    }

    if (SENDGRID_API_KEY) {
      // Auto-reply to lead
      const confirmationHtml = `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2d5016 0%, #4a7c28 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-family: Georgia, serif;">Thank You, ${firstName}!</h1>
          </div>
          <div style="padding: 30px; background: #faf8f5;">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">We've received your message and our team will reach out within 24 hours to help you book your visit.</p>
            ${procedure ? `<p style="font-size: 16px; color: #333;"><strong>Interest:</strong> ${procedure}</p>` : ''}
            ${message ? `<p style="font-size: 16px; color: #333;"><strong>Your message:</strong> ${message}</p>` : ''}
            <p style="font-size: 16px; color: #333; margin-top: 20px;">In the meantime, feel free to call us at <strong>(801) 501-9000</strong>.</p>
          </div>
          <div style="background: #2d5016; padding: 20px; text-align: center;">
            <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px;">Falling Waters Day Spa & Salon — Saratoga Springs, UT</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: email,
        from: FROM_EMAIL,
        subject: 'Thanks for contacting Falling Waters Day Spa!',
        html: confirmationHtml,
      });

      // Notification to business
      const notificationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2d5016; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${fullName}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="mailto:${leadData.email}">${leadData.email}</a></td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${leadData.phone || 'Not provided'}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Procedure:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${procedure || 'Not specified'}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Preferred Contact:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${contactMethod || 'Not specified'}</td></tr>
            </table>
            ${message ? `<div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #ddd;"><strong>Message:</strong><br/><p style="margin: 10px 0 0 0;">${message}</p></div>` : ''}
          </div>
          <div style="background: #1a1a1a; padding: 15px; text-align: center;">
            <p style="color: #888; margin: 0; font-size: 12px;">Lead from fallingwatersdayspa.com</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: SITE_EMAIL,
        from: FROM_EMAIL,
        fromName: `${fullName} via Falling Waters`,
        subject: `New Lead: ${fullName}${procedure ? ' - ' + procedure : ''}`,
        html: notificationHtml,
        replyTo: email,
        cc: 'bryce@gullstack.com',
      });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please call us at (801) 501-9000.' });
  }
}
