// api/verify-session.js
// Vercel Serverless Function — prueft serverseitig, ob eine Stripe-Session wirklich bezahlt
// wurde. Wird NACH der Rueckkehr von Stripe aufgerufen, bevor die App-Generierung beginnt.
// Das ist der Sicherheits-Check: niemand kann das per URL faken, da die Pruefung direkt bei
// Stripe passiert, nicht ueber einen manipulierbaren URL-Parameter.

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) {
      return res.status(400).json({ error: 'session_id fehlt', paid: false });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // payment_status ist 'paid' bei Einmalzahlungen.
    // Bei Abos (mode: subscription) ist es 'paid' sobald die erste Zahlung durch ist.
    const isPaid = session.payment_status === 'paid';

    return res.status(200).json({ paid: isPaid });

  } catch (err) {
    console.error('Stripe Verify Fehler:', err);
    return res.status(500).json({ error: err.message || 'Interner Fehler bei der Zahlungspruefung', paid: false });
  }
};
