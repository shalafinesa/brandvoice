const ALLOWED = ['https://brand-voice.space', 'https://www.brand-voice.space'];

module.exports = async function handler(req, res) {
  const origin = req.headers['origin'] || '';
  const co = ALLOWED.includes(origin) ? origin : ALLOWED[0];
  res.setHeader('Access-Control-Allow-Origin', co);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { content, platform, brandName, niche } = req.body;
  if (!content) return res.status(400).json({ error: 'Missing content' });

  try {
    const prompt = `You are a professional graphic designer. Based on this social media post, create a Canva design search query.

BRAND: ${brandName || 'Brand'}
NICHE: ${niche || 'Business'}
PLATFORM: ${platform || 'Social media'}
POST: ${content.slice(0, 300)}

Write a short Canva template search query (max 60 characters) that finds the best matching design template. Be specific about style and format.

Reply with ONLY the search query, nothing else. Example: "motivational business quote dark professional"`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 80,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const designQuery = data.content[0].text.trim().replace(/^["']|["']$/g, '');
    const canvaUrl = `https://www.canva.com/search/templates?q=${encodeURIComponent(designQuery)}`;
    return res.status(200).json({ designQuery, canvaUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
