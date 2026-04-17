const ALLOWED = ['https://brand-voice.space', 'https://www.brand-voice.space'];

module.exports = async function handler(req, res) {
  const origin = req.headers['origin'] || '';
  const co = ALLOWED.includes(origin) ? origin : ALLOWED[0];
  res.setHeader('Access-Control-Allow-Origin', co);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, userId } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const params = new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price]': process.env.STRIPE_PRICE_ID,
      'line_items[0][quantity]': '1',
      'mode': 'subscription',
      'customer_email': email,
      'client_reference_id': userId || '',
      'subscription_data[trial_period_days]': '3',
      'success_url': `${co}?payment=success`,
      'cancel_url': `${co}?payment=cancelled`,
    });

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await response.json();
    if (session.error) throw new Error(session.error.message);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Checkout failed.' });
  }
};
