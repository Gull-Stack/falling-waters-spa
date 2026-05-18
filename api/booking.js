// Falling Waters Day Spa - Booking Request Handler
// Receives an appointment request from /book and emails the spa a
// notification + sends the guest an auto-reply confirmation. Mirrors the
// SendGrid + Supabase setup used by api/contact.js.

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SITE_EMAIL = process.env.SITE_EMAIL || 'Spa@tacfitness.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'leads@gullstack.com';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

async function sendEmail({ to, from, fromName, subject, html, replyTo, cc }) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        { to: [{ email: to }], ...(cc ? { cc: [{ email: cc }] } : {}) },
      ],
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
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      service,
      provider,
      when,
      total,
      tacMember,
      fax_number, // honeypot
      _timestamp,
    } = req.body || {};

    // Lightweight spam guards (honeypot + submit speed)
    if (fax_number) return res.status(200).json({ success: true, emailed: false });
    if (_timestamp) {
      const elapsed = Date.now() - parseInt(_timestamp, 10);
      if (elapsed > 0 && elapsed < 2500)
        return res.status(200).json({ success: true, emailed: false });
    }

    if (!firstName || !phone || !service || !when) {
      return res
        .status(400)
        .json({ error: 'Missing required booking details.' });
    }

    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    let emailed = false;

    // Store the request in Supabase if configured
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            name: fullName,
            email: (email || '').trim().toLowerCase() || null,
            phone: String(phone).trim(),
            interest: service,
            message: `Booking request — ${service} · ${provider || 'No preference'} · ${when}${total ? ' · ' + total : ''}`,
            source: 'fallingwatersdayspa.com/book',
            status: 'new',
            created_at: new Date().toISOString(),
          }),
        });
      } catch (e) {
        console.error('Supabase insert error:', e);
      }
    }

    if (SENDGRID_API_KEY) {
      const rows = [
        ['Guest', fullName],
        ['Phone', phone],
        ['Email', email || 'Not provided'],
        ['Service', service],
        ['Provider', provider || 'No preference'],
        ['Requested time', when],
        ['TAC member', tacMember ? 'Yes — 10% discount' : 'No'],
        ['Estimated total', total || '—'],
      ]
        .map(
          ([k, v]) =>
            `<tr><td style="padding:10px;border-bottom:1px solid #e7e2da;color:#8b9097;"><strong>${esc(k)}</strong></td><td style="padding:10px;border-bottom:1px solid #e7e2da;color:#2C3E50;">${esc(v)}</td></tr>`,
        )
        .join('');

      // Notification to the spa
      const notify = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#4A90A4;padding:22px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:20px;">New Booking Request</h1>
          </div>
          <div style="padding:26px;background:#faf8f5;">
            <p style="color:#333;font-size:15px;margin-top:0;">A guest requested an appointment on fallingwatersdayspa.com. Call or text them to confirm the time.</p>
            <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e7e2da;border-radius:8px;">${rows}</table>
          </div>
          <div style="background:#2C3E50;padding:14px;text-align:center;">
            <p style="color:#9aa0a6;margin:0;font-size:12px;">Booking request from fallingwatersdayspa.com/book</p>
          </div>
        </div>`;

      const notifyOk = await sendEmail({
        to: SITE_EMAIL,
        from: FROM_EMAIL,
        fromName: `${fullName} via Falling Waters`,
        subject: `New Booking Request: ${fullName} — ${service}`,
        html: notify,
        replyTo: email || undefined,
        cc: 'bryce@gullstack.com',
      });

      // Auto-reply to the guest
      if (email) {
        const reply = `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#4A90A4,#7FB5C5);padding:30px;text-align:center;">
              <h1 style="color:#fff;margin:0;">Thank you, ${esc(firstName)}!</h1>
            </div>
            <div style="padding:30px;background:#faf8f5;color:#333;font-size:16px;line-height:1.6;">
              <p style="margin-top:0;">We've received your appointment request and will text you shortly to confirm your time.</p>
              <p style="background:#fff;border:1px solid #e7e2da;border-radius:8px;padding:16px;">
                <strong>${esc(service)}</strong><br/>
                ${esc(provider || 'No preference')}<br/>
                ${esc(when)}
              </p>
              <p>Questions? Call or text us at <strong>(801)&nbsp;501-9000</strong>.</p>
            </div>
            <div style="background:#2C3E50;padding:18px;text-align:center;">
              <p style="color:rgba(255,255,255,0.65);margin:0;font-size:13px;">Falling Waters Day Spa &amp; Salon · Draper, UT · Est. 1998</p>
            </div>
          </div>`;
        await sendEmail({
          to: email,
          from: FROM_EMAIL,
          subject: 'Your appointment request — Falling Waters Day Spa',
          html: reply,
        });
      }

      emailed = notifyOk;
    }

    return res.status(200).json({ success: true, emailed });
  } catch (error) {
    console.error('Booking request error:', error);
    return res
      .status(500)
      .json({ error: 'Something went wrong. Please call us at (801) 501-9000.' });
  }
}
