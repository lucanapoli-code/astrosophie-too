const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS || 'Mental & Spiritual <onboarding@resend.dev>';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' });
  }

  try {
    const { to, subject, html, type } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'to, subject und html sind Pflichtfelder' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(to)) {
      return res.status(400).json({ error: 'Ungueltige E-Mail-Adresse' });
    }

    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: subject,
      html: html
    });

    if (result.error) {
      console.error('Resend Fehler:', result.error);
      return res.status(500).json({ error: result.error.message || 'E-Mail-Versand fehlgeschlagen' });
    }

    return res.status(200).json({ ok: true, id: result.data ? result.data.id : null, type: type || 'unbekannt' });

  } catch (err) {
    console.error('E-Mail-Versand Fehler:', err);
    return res.status(500).json({ error: err.message || 'Interner Fehler beim E-Mail-Versand' });
  }
};
