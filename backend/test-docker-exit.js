const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function main() {
  const container = await docker.createContainer({
    Image: 'node:18',
    Cmd: ['/bin/sh', '-c', 'sleep 3600'],
    Tty: true,
  });
  await container.start();
  console.log('Container started');

  const exec = await container.exec({
    Cmd: ['/bin/sh', '-c', 'exit 1'],
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
  });

  const stream = await exec.start({ Detach: false, Tty: true });

  await new Promise((resolve) => {
    stream.on('end', async () => {
      console.log('Stream ended');
      const inspect = await exec.inspect();
      console.log('Inspect ExitCode:', inspect.ExitCode);
      resolve();
    });
    // Fallback if end doesn't fire
    setTimeout(async () => {
      console.log('Timeout');
      const inspect = await exec.inspect();
      console.log('Timeout Inspect ExitCode:', inspect.ExitCode);
      resolve();
    }, 2000);
  });

  await container.stop();
  await container.remove();
}

main().catch(console.error);
