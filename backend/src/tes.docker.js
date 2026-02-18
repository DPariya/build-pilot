import docker from "./services/docker.service.js";

const testDocker = async () => {
  const container = await docker.createContainer({
    Image: "node:18",
    Cmd: ["node", "-v"],
    Tty: false,
  });

  await container.start();

  const logs = await container.logs({
    stdout: true,
    stderr: true,
  });

  console.log(logs.toString());

  await container.remove({ force: true });
};

testDocker();
