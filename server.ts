// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from '@/lib/socket';
import { createServer, Server as HTTPServer } from 'http';
import { AddressInfo } from 'net';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
let port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

// Custom server with Socket.IO integration
async function createCustomServer() {
  try {
    // Create Next.js app
    const nextApp = next({
      dev,
      dir: process.cwd(),
      // In production, use the current directory where .next is located
      conf: dev ? undefined : { distDir: './.next' }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server that will handle both Next.js and Socket.IO
    const server = createServer((req, res) => {
      // Skip socket.io requests from Next.js handler
      if (req.url?.startsWith('/api/socketio')) {
        return;
      }
      handle(req, res);
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    setupSocket(io);

    // Function to start server with dynamic port
    function startServer(currentPort: number) {
      server.listen(currentPort, hostname, () => {
        const address = server.address() as AddressInfo;
        const actualPort = address?.port || currentPort;
        console.log(`> Ready on http://localhost:${actualPort}`);
        console.log(`> Socket.IO server running at ws://localhost:${actualPort}/api/socketio`);
        if (dev) {
          console.log(`> Open your browser to http://localhost:${actualPort}`);
        }
      }).on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${currentPort} is busy, trying ${currentPort + 1}`);
          startServer(currentPort + 1);
        } else {
          console.error('Server startup error:', err);
          process.exit(1);
        }
      });
    }

    // Start the server
    startServer(port);

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();
