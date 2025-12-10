import net from "node:net";

export async function findAvailablePort(
  startPort: number,
  maxTries = 50,
): Promise<number> {
  let port = startPort;

  while (port < startPort + maxTries) {
    const isFree = await new Promise<boolean>((resolve) => {
      const server = net
        .createServer()
        .once("error", (err: any) => {
          if (err && (err.code === "EADDRINUSE" || err.code === "EACCES")) {
            resolve(false);
          } else {
            resolve(false);
          }
        })
        .once("listening", () => {
          server.close(() => resolve(true));
        });

      server.listen(port);
    });

    if (isFree) {
      return port;
    }

    port += 1;
  }

  throw new Error(
    `No available port found for HMR in range ${startPort}-${startPort + maxTries - 1}`,
  );
}
