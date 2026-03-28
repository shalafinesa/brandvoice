const rateLimitStore = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;
const MAX_PROMPT_LENGTH = 4000;

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip) || { count: 0, start: now };
  if (now - record.start > RATE_WINDOW) {
    rateLimitStore.set(ip, { count: 1, start: now });
    return false;
  }
  if (record.count >= RATE_LIMIT) return true;
  rateLimitStore.set(ip, { count: record.count + 1, start: record.start });
  return false;
}

function verifyNetlifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.sub || !payload.email) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

exports.handler = async (event) => {
  const allowedOrigins = [
    "https://brand-voice.space",
    "https://www.brand-voice.space",
    "https://finesashala-brandvoice.netlify.app",
  ];
  const origin = event.headers["origin"] || "";
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // 1. AUTH — must be signed in
  const user = verifyNetlifyToken(event.headers["authorization"]);
  if (!user) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Unauthorized. Please sign in to generate content." }),
    };
  }

  // 2. RATE LIMIT — 10 requests per minute per IP
  const ip = event.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return {
      statusCode: 429,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
    };
  }

  // 3. VALIDATE INPUT
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Invalid request." }) };
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Missing messages." }) };
  }

  const totalLength = body.messages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
  if (totalLength > MAX_PROMPT_LENGTH) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Prompt too long. Please shorten your inputs." }) };
  }

  // 4. CALL ANTHROPIC
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: body.messages,
      }),
    });

    const data = await response.json();
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "Generation failed. Please try again." }) };
  }
};
