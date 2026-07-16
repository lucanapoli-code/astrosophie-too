const https = require('https');

exports.handler = async function(event) {
  if(event.httpMethod !== 'POST') {
    return {statusCode:405, body:'Method Not Allowed'};
  }

  const KEY = process.env.ANTHROPIC_API_KEY;
  if(!KEY) {
    return {statusCode:500, headers:{'Access-Control-Allow-Origin':'*'}, body:JSON.stringify({error:'API Key fehlt'})};
  }

  return new Promise(function(resolve) {
    try {
      const body = JSON.parse(event.body);
      const data = JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: body.messages || []
      });

      const req = https.request({
        hostname: 'api.anthropic.com',
        port: 443,
        path: '/v1/messages',
        method: 'POST',
        timeout: 25000,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(data)
        }
      }, function(res) {
        let body = '';
        res.on('data', function(chunk) { body += chunk; });
        res.on('end', function() {
          resolve({
            statusCode: res.statusCode,
            headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},
            body: body
          });
        });
      });

      req.on('timeout', function() {
        req.destroy();
        resolve({statusCode:504, headers:{'Access-Control-Allow-Origin':'*'}, body:JSON.stringify({error:'Timeout'})});
      });

      req.on('error', function(e) {
        resolve({statusCode:500, headers:{'Access-Control-Allow-Origin':'*'}, body:JSON.stringify({error:e.message})});
      });

      req.write(data);
      req.end();

    } catch(e) {
      resolve({statusCode:500, headers:{'Access-Control-Allow-Origin':'*'}, body:JSON.stringify({error:e.message})});
    }
  });
};
