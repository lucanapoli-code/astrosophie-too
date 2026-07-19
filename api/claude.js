const https = require('https');

module.exports.config = {
  api: { bodyParser: false }
};

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if(req.method === 'OPTIONS') return res.status(200).end();
  if(req.method !== 'POST') return res.status(405).json({error:'Method Not Allowed'});

  const KEY = process.env.ANTHROPIC_API_KEY;
  if(!KEY) return res.status(500).json({error:'API Key fehlt'});

  const body = await new Promise(function(resolve) {
    let raw = '';
    req.on('data', function(chunk) { raw += chunk.toString(); });
    req.on('end', function() {
      try { resolve(JSON.parse(raw)); }
      catch(e) { resolve({}); }
    });
  });

  return new Promise(function(resolve) {
    // system NUR wenn nicht leer
    const payload = {
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: body.messages || []
    };
    if(body.system && body.system.trim()) {
      payload.system = body.system;
    }

    const data = JSON.stringify(payload);

    const request = https.request({
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(data)
      }
    }, function(apiRes) {
      let result = '';
      apiRes.on('data', function(chunk) { result += chunk; });
      apiRes.on('end', function() {
        try { res.status(apiRes.statusCode).json(JSON.parse(result)); }
        catch(e) { res.status(500).json({error:'Parse error'}); }
        resolve();
      });
    });

    request.on('error', function(e) {
      res.status(500).json({error: e.message});
      resolve();
    });

    request.write(data);
    request.end();
  });
};
