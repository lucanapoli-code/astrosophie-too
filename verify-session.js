// /api/verify-session.js
// Prüft serverseitig bei Stripe nach, ob eine Checkout-Session wirklich
// erfolgreich bezahlt wurde. Das ist der Grund, warum wir NICHT einfach dem
// Client vertrauen dürfen, der per URL "?paid=1" mitschickt - das könnte
// jeder von Hand in die Adresszeile eintippen. Diese Funktion fragt bei
// Stripe selbst nach, mit dem geheimen Secret Key, den nur der Server kennt.

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) { res.status(400).json({ error: 'session_id fehlt', paid: false }); return; }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === 'paid' || session.status === 'complete';

    res.status(200).json({
      paid: paid,
      pkg: null, // Paket wird clientseitig aus sessionStorage wiederhergestellt
      customerEmail: session.customer_details ? session.customer_details.email : null
    });
  } catch (err) {
    console.error('Verifikations-Fehler:', err);
    res.status(500).json({ error: err.message || 'Verifikation fehlgeschlagen', paid: false });
  }
};
