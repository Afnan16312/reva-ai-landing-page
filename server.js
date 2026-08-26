const http = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

console.log(`[Reva Server] Starting Next.js (dev=${dev}) on port ${port}...`);

app.prepare().then(() => {
  const server = http.createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.listen(port, () => {
    console.log(`[Reva Server] > Ready on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('[Reva Server] Next preparation error:', err);
  process.exit(1);
});
