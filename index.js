import { WebSocketServer } from "ws";
import url from "url";

var wss = new WebSocketServer({ port: 8100 });

wss.getUniqueID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return s4() + s4() + "-" + s4();
};

wss.on("connection", function connection(ws, req) {
  const parameters = url.parse(req.url, true);

  if (!parameters.query.email) {
    ws.close();
  }

  ws.id = wss.getUniqueID();
  ws.email = parameters.query.email;

  wss.clients.forEach(function each(client) {
    if (ws.email !== client.email) {
      // ws.send("Client " + client.email + " with ID " + ws.id + " connected");
      ws.send(
        JSON.stringify({
          type: "connect",
          email: client.email,
          id: ws.id,
        })
      );
    }
  });

  // wss.broadcast("Client " + ws.email + " with ID " + ws.id + " connected");
  wss.broadcast(
    JSON.stringify({
      type: "connect",
      email: ws.email,
      id: ws.id,
    })
  );

  ws.on("message", function (message) {
    // wss.broadcast(message);
    wss.broadcast(
      JSON.stringify({
        type: "message",
        email: ws.email,
        id: ws.id,
        message: message.toString(),
      })
    );
  });

  ws.on("close", function close() {
    wss.clients.forEach(function each(client) {
      // ws.send("Client " + client.email + " with ID " + ws.id + " disconnected");
      ws.send(
        JSON.stringify({
          type: "disconnect",
          email: client.email,
          id: ws.id,
        })
      );
    });
    console.log("disconnected");
  });
});

wss.broadcast = function broadcast(msg) {
  console.log(msg.toString());
  wss.clients.forEach(function each(client) {
    client.send(msg.toString());
  });
};

wss.on("listening", () => {
  console.log("listening on 8100");
});
