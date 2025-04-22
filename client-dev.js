const { spawn } = require('child_process');
const { createServer } = require('vite');
const path = require('path');

async function startClientServer() {
  try {
    console.log('Starting Vite development server for client...');
    
    const clientPort = process.env.CLIENT_PORT || 3002;
    
    const server = await createServer({
      configFile: path.resolve(__dirname, 'client/vite.config.ts'),
      root: path.resolve(__dirname, 'client'),
      server: {
        port: clientPort,
        host: '0.0.0.0'
      }
    });
    
    await server.listen();
    server.printUrls();
    
    console.log('Vite client server started successfully!');
  } catch (error) {
    console.error('Failed to start Vite server:', error);
    process.exit(1);
  }
}

startClientServer();