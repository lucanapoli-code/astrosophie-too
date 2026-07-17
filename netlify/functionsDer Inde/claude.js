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
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        stream: true,
        messages: body.messages || []
      });

      const options = {
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
      };

      const req = https.request(options, function(res) {
        let fullText = '';
        let buffer = '';

        res.on('data', function(chunk) {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for(const line of lines) {
            if(line.startsWith('data: ')) {
              const d = line.slice(6).trim();
              if(d === '[DONE]') continue;
              try {
                const j = JSON.parse(d);
                if(j.type === 'content_block_delta' && j.delta && j.delta.text) {
                  fullText += j.delta.text;
                }
              } catch(e) {}
            }
          }
        });

        res.on('end', function() {
          resolve({
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
              content: [{type: 'text', text: fullText}]
            })
          });
        });
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
