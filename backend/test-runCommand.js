const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function runCommandInContainer(dockerContainer, cmd) {
  const exec = await dockerContainer.exec({
    Cmd: ['/bin/sh', '-c', cmd],
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
  });
  const stream = await exec.start({ Detach: false, Tty: true });
  stream.on('data', (c) => process.stdout.write(c));
  return new Promise((resolve) => {
    stream.on('end', async () => {
      const inspect = await exec.inspect();
      resolve(inspect.ExitCode);
    });
  });
}

async function main() {
  const container = await docker.createContainer({
    Image: 'node:18',
    Cmd: ['/bin/sh', '-c', 'sleep 3600'],
    Tty: true,
  });
  await container.start();

  console.log('Running exit 1');
  const code1 = await runCommandInContainer(container, 'exit 1');
  console.log('ExitCode:', code1);

  console.log('Running exit 0');
  const code0 = await runCommandInContainer(container, 'exit 0');
  console.log('ExitCode:', code0);

  await container.stop();
  await container.remove();
}

main().catch(console.error);
