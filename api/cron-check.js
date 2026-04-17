module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();

  const SB_URL = process.env.SUPABASE_URL;
  const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY;
  if (!SB_URL || !SB_SERVICE) return res.status(500).json({ error: 'Missing env vars' });

  try {
    const now = new Date().toISOString();
    const r = await fetch(
      `${SB_URL}/rest/v1/scheduled_posts?status=eq.scheduled&scheduled_for=lte.${now}&select=id`,
      { headers: { apikey: SB_SERVICE, Authorization: `Bearer ${SB_SERVICE}` } }
    );
    const due = await r.json();

    if (due?.length > 0) {
      const ids = due.map(p => p.id);
      await fetch(`${SB_URL}/rest/v1/scheduled_posts?id=in.(${ids.join(',')})`, {
        method: 'PATCH',
        headers: {
          apikey: SB_SERVICE,
          Authorization: `Bearer ${SB_SERVICE}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ status: 'due' }),
      });
    }

    return res.status(200).json({ checked: true, due: due?.length || 0 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
