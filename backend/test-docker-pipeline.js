const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function main() {
  const container = await docker.createContainer({
    Image: 'node:18',
    Cmd: ['/bin/sh', '-c', 'sleep 3600'],
    Tty: true,
  });
  await container.start();

  const cmd = `cd / && if [ -f not_exists ]; then echo yes; else npx foo_bar_not_exists || exit 1; fi`;

  const exec = await container.exec({
    Cmd: ['/bin/sh', '-c', cmd],
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
  });

  const stream = await exec.start({ Detach: false, Tty: true });

  stream.on('data', (c) => process.stdout.write(c.toString()));

  await new Promise((resolve) => {
    stream.on('end', async () => {
      const inspect = await exec.inspect();
      console.log('Stream ended! ExitCode:', inspect.ExitCode);
      resolve();
    });
    // Fallback if end doesn't fire
    setTimeout(async () => {
      const inspect = await exec.inspect();
      console.log('Timeout hit! ExitCode:', inspect.ExitCode);
      resolve();
    }, 5000);
  });

  await container.stop();
  await container.remove();
}

main().catch(console.error);
