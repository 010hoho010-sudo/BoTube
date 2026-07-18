const http = require('http');

function startHealthServer(port = process.env.PORT || 3000) {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', bot: 'VideoBot', time: new Date().toISOString() }));
  });

  server.listen(port, () => {
    console.log(`💓 سيرفر النبض شغال على المنفذ ${port}`);
  });

  return server;
}

module.exports = { startHealthServer };
