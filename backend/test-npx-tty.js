const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function main() {
  const container = await docker.createContainer({
    Image: 'node:18',
    Cmd: ['/bin/sh', '-c', 'sleep 3600'],
    Tty: true,
  });
  await container.start();

  // Create a bad ts file
  await container
    .exec({ Cmd: ['/bin/sh', '-c', 'echo "let x: number = \'str\';" > index.ts'] })
    .then((e) => e.start());
  await container
    .exec({
      Cmd: [
        '/bin/sh',
        '-c',
        'echo "{ \\"compilerOptions\\": { \\"strict\\": true } }" > tsconfig.json',
      ],
    })
    .then((e) => e.start());

  const exec = await container.exec({
    Cmd: ['/bin/sh', '-c', 'npx tsc --noEmit || exit 1'],
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
  });
  const stream = await exec.start({ Detach: false, Tty: true });
  stream.on('data', (c) => process.stdout.write(c));

  await new Promise((resolve) => {
    stream.on('end', async () => {
      const inspect = await exec.inspect();
      console.log('\nExitCode:', inspect.ExitCode);
      resolve();
    });
  });

  await container.stop();
  await container.remove();
}

main().catch(console.error);
