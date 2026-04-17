const rateLimitStore = new Map();
const RATE_LIMIT = 15;
const RATE_WINDOW = 60 * 1000;
const MAX_LEN = 5000;

function isRateLimited(ip) {
  const now = Date.now();
  const r = rateLimitStore.get(ip) || { count: 0, start: now };
  if (now - r.start > RATE_WINDOW) { rateLimitStore.set(ip, { count: 1, start: now }); return false; }
  if (r.count >= RATE_LIMIT) return true;
  rateLimitStore.set(ip, { count: r.count + 1, start: r.start });
  return false;
}

function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const parts = authHeader.replace('Bearer ', '').trim().split('.');
  if (parts.length !== 3) return null;
  try {
    const p = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    if (p.exp && p.exp < Math.floor(Date.now() / 1000)) return null;
    if (!p.sub) return null;
    return p;
  } catch { return null; }
}

const ALLOWED = ['https://brand-voice.space', 'https://www.brand-voice.space'];

module.exports = async function handler(req, res) {
  const origin = req.headers['origin'] || '';
  const co = ALLOWED.includes(origin) ? origin : ALLOWED[0];
  res.setHeader('Access-Control-Allow-Origin', co);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req.headers['authorization']);
  if (!user) return res.status(401).json({ error: 'Unauthorized. Please sign in.' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });

  const body = req.body;
  if (!body?.messages?.length) return res.status(400).json({ error: 'Missing messages.' });

  const total = body.messages.reduce((s, m) => s + (m.content?.length || 0), 0);
  if (total > MAX_LEN) return res.status(400).json({ error: 'Prompt too long.' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1200, messages: body.messages }),
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Generation failed. Please try again.' });
  }
};
