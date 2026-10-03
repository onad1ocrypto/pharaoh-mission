/* PHARAOH QUEST — global leaderboard (Vercel serverless + Upstash Redis REST)
   Env vars (Vercel project settings):
     UPSTASH_REDIS_REST_URL   e.g. https://xxxx.upstash.io
     UPSTASH_REDIS_REST_TOKEN e.g. AXx...
*/
export default async function handler(req, res) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const tok = process.env.UPSTASH_REDIS_REST_TOKEN;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!url || !tok) {
    return res.status(501).json({ error: 'leaderboard not configured on server' });
  }

  const cmd = async (command) => {
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });
    const j = await r.json();
    if (j.error) throw new Error(j.error);
    return j.result;
  };

  const top10 = async () => {
    const flat = (await cmd(['ZRANGE', 'lb:top', '0', '9', 'REV', 'WITHSCORES'])) || [];
    const top = [];
    for (let i = 0; i < flat.length; i += 2) top.push({ u: flat[i], s: Number(flat[i + 1]) });
    return top;
  };

  try {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 's-maxage=10');
      return res.status(200).json({ top: await top10() });
    }

    if (req.method === 'POST') {
      let u = String((req.body && req.body.u) || '').trim().slice(0, 16);
      let s = Math.floor(Number((req.body && req.body.s)));
      if (!/^[A-Za-z0-9_ ]{3,16}$/.test(u)) return res.status(400).json({ error: 'bad username' });
      if (!Number.isFinite(s) || s < 0 || s > 9999999) return res.status(400).json({ error: 'bad score' });

      const prev = Number((await cmd(['ZSCORE', 'lb:top', u])) || 0);
      if (s > prev) await cmd(['ZADD', 'lb:top', String(s), u]);
      return res.status(200).json({ top: await top10(), best: Math.max(prev, s) });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'redis error' });
  }
}
