module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const event = req.body;
  const SB_URL = process.env.SUPABASE_URL;
  const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY;

  const updateSub = async (data) => {
    await fetch(`${SB_URL}/rest/v1/subscriptions`, {
      method: 'POST',
      headers: {
        'apikey': SB_SERVICE,
        'Authorization': `Bearer ${SB_SERVICE}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(data),
    });
  };

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      if (s.client_reference_id) {
        await updateSub({ user_id: s.client_reference_id, stripe_customer_id: s.customer, stripe_subscription_id: s.subscription, status: 'trialing', created_at: new Date().toISOString() });
      }
    }
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
      const sub = event.data.object;
      const r = await fetch(`${SB_URL}/rest/v1/subscriptions?stripe_customer_id=eq.${sub.customer}`, { headers: { 'apikey': SB_SERVICE, 'Authorization': `Bearer ${SB_SERVICE}` } });
      const rows = await r.json();
      if (rows?.length) await updateSub({ user_id: rows[0].user_id, stripe_customer_id: sub.customer, stripe_subscription_id: sub.id, status: sub.status, current_period_end: new Date(sub.current_period_end * 1000).toISOString() });
    }
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const r = await fetch(`${SB_URL}/rest/v1/subscriptions?stripe_customer_id=eq.${sub.customer}`, { headers: { 'apikey': SB_SERVICE, 'Authorization': `Bearer ${SB_SERVICE}` } });
      const rows = await r.json();
      if (rows?.length) await updateSub({ user_id: rows[0].user_id, stripe_customer_id: sub.customer, stripe_subscription_id: sub.id, status: 'canceled' });
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
