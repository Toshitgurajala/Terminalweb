const WebSocket = require('ws');
const os = require('os');
const pty = require('node-pty');

const wss = new WebSocket.Server({ port: 6060 });
const shells = {}; // Stores the terminal instances

console.log('Socket is up and running...');

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

function createTerminal() {
  const shell = '/Users/toshitgurajala/Desktop/temp/init.sh';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    env: process.env,
  });

  return ptyProcess;
}

wss.on('connection', ws => {
  console.log('New session');

  const sessionId = generateUniqueId();
  const ptyProcess = createTerminal();

  shells[sessionId] = {
    ptyProcess,
    ws,
  };

  ws.on('message', command => {
    const { ptyProcess } = shells[sessionId];
    ptyProcess.write(command);
  });

  ptyProcess.on('data', function (data) {
    const { ws } = shells[sessionId];
    ws.send(data);
    console.log(data);
  });

  ws.on('close', () => {
    const { ptyProcess } = shells[sessionId];
    ptyProcess.kill();
    delete shells[sessionId];
    console.log('Session closed');
  });
});
