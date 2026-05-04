const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function main() {
  const container = await docker.createContainer({
    Image: 'node:18',
    Cmd: ['/bin/sh', '-c', 'sleep 3600'],
    Tty: true,
  });
  await container.start();
  const exec = await container.exec({
    Cmd: ['/bin/sh', '-c', 'echo hi'],
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
  });

  const stream = await exec.start({ Detach: false, Tty: true });

  await new Promise((resolve) => {
    stream.on('end', async () => {
      console.log('end fired');
      resolve();
    });
    stream.on('close', async () => {
      console.log('close fired');
      resolve();
    });
    setTimeout(() => {
      console.log('Timeout hit');
      resolve();
    }, 2000);
  });

  await container.stop();
  await container.remove();
}

main().catch(console.error);
