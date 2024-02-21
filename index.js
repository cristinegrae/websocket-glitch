import { WebSocketServer } from "ws";

var wss = new WebSocketServer({ port: 8100 });

wss.on("connection", function connection(ws) {
  ws.on("message", function (message) {
    wss.broadcast(message);
  });
});

wss.broadcast = function broadcast(msg) {
  console.log(msg.toString());
  wss.clients.forEach(function each(client) {
    client.send(msg.toString());
  });
};

wss.on('listening',()=>{
    console.log('listening on 8100')
 })