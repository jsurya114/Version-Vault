const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function main() {
  const container = await docker.createContainer({
    Image: 'ubuntu:latest',
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
      const inspect1 = await exec.inspect();
      console.log('Inspect right after stream end:', inspect1.ExitCode, inspect1.Running);

      setTimeout(async () => {
        const inspect2 = await exec.inspect();
        console.log('Inspect 1s later:', inspect2.ExitCode, inspect2.Running);
        resolve();
      }, 1000);
    });
  });

  await container.stop();
  await container.remove();
}

main().catch(console.error);
