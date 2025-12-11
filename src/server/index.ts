import http from "node:http";
import colors from "picocolors";
import { WebSocket, WebSocketServer } from "ws";
import { createShortcuts } from "@/utils/createShortcuts";
import { findAvailablePort } from "@/utils/port";

type ServerOptions = {
  port: number;
};

const server = await createDevServer({ port: 3030 });

export async function createDevServer({ port = 3030 }: ServerOptions) {
  const serverPort = await findAvailablePort(port);

  const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(getHtmlClient(serverPort)); // Helper function below for cleaner code
      return;
    }

    res.writeHead(404);
    res.end("Not Found");
  });

  // 2. Create WebSocket Server
  const wss = new WebSocketServer({ noServer: true });

  // 3. Handle Upgrade Request
  server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  // 4. WebSocket Logic
  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "system", msg: "Welcome to the server!" }));

    ws.on("message", (data) => {
      const message = data.toString();
      console.log(colors.blue(`  📩 Received:`), message);
      ws.send(`Echo: ${message}`);
    });
  });

  // 5. Start Listening
  return new Promise<{
    server: http.Server;
    wss: WebSocketServer;
    port: number;
    stop: () => void;
  }>((resolve) => {
    server.listen(serverPort, () => {
      console.log(
        colors.green(`\n  🚀 Server running at http://localhost:${serverPort}`),
      );

      // Bind shortcuts and get the cleanup function
      const disposeShortcuts = createShortcuts({
        context: { wss, server },
        shortcuts: [
          {
            key: "b",
            description: "broadcast 'Hello' to all clients",
            action({ wss }) {
              let count = 0;
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send("Hello from Server CLI! 👋");
                  count++;
                }
              });
              console.log(
                colors.green(`  ✓ Broadcast sent to ${count} clients`),
              );
            },
          },
          {
            key: "c",
            description: "count active connections",
            action({ wss }) {
              console.log(
                colors.cyan(`  ℹ Active connections: ${wss.clients.size}`),
              );
            },
          },
          {
            key: "q",
            description: "quit server",
            action() {
              stop(); // Call the stop function defined below
            },
          },
        ],
      });

      // Define a clean stop function
      const stop = () => {
        console.log(colors.gray("  Stopping server..."));
        disposeShortcuts(); // Remove CLI listeners
        wss.clients.forEach((c) => {
          c.terminate();
        }); // Kill WS connections
        wss.close();
        server.close(() => {
          console.log(colors.gray("  Server stopped."));
          process.exit(0);
        });
      };

      resolve({ server, wss, port: serverPort, stop });
    });
  });
}

// Helper to keep the main logic clean
function getHtmlClient(port: number) {
  return `
      <!DOCTYPE html>
      <html>
      <body>
        <h2>WebSocket Test</h2>
        <div id="status" style="color:red">Disconnected</div>
        <div id="log"></div>
        <script>
          const ws = new WebSocket("ws://localhost:${port}");
          const log = document.getElementById("log");
          const status = document.getElementById("status");

          ws.onopen = () => { 
            status.innerText = "Connected"; 
            status.style.color = "green"; 
            console.log("Connected"); 
          };
          
          ws.onmessage = (event) => {
            const p = document.createElement("p");
            p.innerText = "Received: " + event.data;
            log.prepend(p);
          };

          ws.onclose = () => { 
            status.innerText = "Disconnected"; 
            status.style.color = "red"; 
          };
        </script>
      </body>
      </html>
    `;
}
