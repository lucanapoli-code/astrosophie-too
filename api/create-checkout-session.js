// api/create-checkout-session.js
// Vercel Serverless Function — startet eine Stripe-Checkout-Session für ein Paket.
// Benoetigt die Umgebungsvariable STRIPE_SECRET_KEY in den Vercel-Projekteinstellungen
// (Settings -> Environment Variables), NICHT im Code selbst.

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Feste Preise in Rappen (CHF), passend zur bestehenden App-Logik.
// WICHTIG: diese Zahlen muessen exakt mit dem uebereinstimmen, was auf der Website steht.
const PRICES = {
  individual:      { amount: 4900, name: 'Individual-Analyse',   desc: 'Alle 3 Lebensbereiche eines Quadranten. Dein persönlicher Slogan inklusive.' },
  seelenkompas:    { amount: 9900, name: 'SeelenKompass',        desc: 'Alle 12 Lebensbereiche. Das vollständige Bild deines Seelenmusters.' },
  jahreshoroskop_once: { amount: 9900, name: 'Jahreshoroskop 2026', desc: 'Das ganze Jahr 2026 sofort — alle 12 Monate direkt lesbar.' },
  jahreshoroskop_monthly: { amount: 900, name: 'Monatshoroskop', desc: 'Jeden Monat neu — dein Horoskop begleitet dich fortlaufend.' },
  // Kombi-Pakete
  ind_jahr:              { amount: 13100, name: 'Individual + Jahreshoroskop' },
  seele_jahr:            { amount: 17900, name: 'SeelenKompass + Jahreshoroskop' },
  ind_jahr_coaching:     { amount: 42000, name: 'Individual + Jahreshoroskop + 1:1 Coaching' },
  seele_jahr_coaching:   { amount: 45000, name: 'SeelenKompass + Jahreshoroskop + 1:1 Coaching' }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' });
  }

  try {
    const { pkg, payMode, returnUrl, combo } = req.body;

    if (!returnUrl) {
      return res.status(400).json({ error: 'returnUrl fehlt' });
    }

    // Kombi-Paket hat Vorrang, falls vorhanden
    let priceInfo;
    let isRecurring = false;

    if (combo && combo.id && PRICES[combo.id]) {
      priceInfo = PRICES[combo.id];
    } else if (pkg === 'jahreshoroskop') {
      if (payMode === 'monthly') {
        priceInfo = PRICES.jahreshoroskop_monthly;
        isRecurring = true;
      } else {
        priceInfo = PRICES.jahreshoroskop_once;
      }
    } else if (PRICES[pkg]) {
      priceInfo = PRICES[pkg];
    } else {
      return res.status(400).json({ error: 'Unbekanntes Paket: ' + pkg });
    }

    const lineItem = {
      price_data: {
        currency: 'chf',
        product_data: {
          name: priceInfo.name,
          description: priceInfo.desc || undefined
        },
        unit_amount: priceInfo.amount
      },
      quantity: 1
    };

    if (isRecurring) {
      lineItem.price_data.recurring = { interval: 'month' };
    }

    const session = await stripe.checkout.sessions.create({
      mode: isRecurring ? 'subscription' : 'payment',
      // TWINT nur bei Einmalzahlungen anbieten: bei Abos (Monatshoroskop) braucht TWINT ein
      // separates Mandat-Verfahren, das komplexer ist und hier bewusst nicht eingebaut wird,
      // um die Zuverlaessigkeit des Abo-Kaufs nicht zu gefaehrden. Karte bleibt bei Abos immer.
      // PFLICHT: NUR Karte und TWINT. NIEMALS 'klarna' oder andere "Rechnung"/"Pay Later"-
      // Zahlungsarten hinzufuegen - das wurde von Luca ausdruecklich ausgeschlossen.
      // 'card' deckt automatisch auch Apple Pay und Google Pay ab (auf unterstuetzten
      // Geraeten/Browsern), ohne dass dafuer ein eigener Eintrag noetig ist.
      payment_method_types: isRecurring ? ['card'] : ['card', 'twint'],
      line_items: [lineItem],
      success_url: returnUrl + (returnUrl.indexOf('?') > -1 ? '&' : '?') + 'paid=1&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: returnUrl + (returnUrl.indexOf('?') > -1 ? '&' : '?') + 'paid=0'
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Stripe Checkout Fehler:', err);
    return res.status(500).json({ error: err.message || 'Interner Fehler beim Starten der Zahlung' });
  }
};
