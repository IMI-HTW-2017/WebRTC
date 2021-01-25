import express from "express";
import {server as WebSocketServer} from "websocket";

const app = express();

app.use(express.static("src/static"));

const server = app.listen(3000);

const connections = [];

const ws = new WebSocketServer({
    httpServer: server,
    fragmentOutgoingMessages: false,
});
ws.on("request", (request) => {
    const connection = request.accept("webrtc-test", request.origin);
    connections.push(connection);
    console.log(connection.remoteAddress + " connected - Protocol Version " + connection.webSocketVersion);

    connection.on("close", function() {
        console.log(connection.remoteAddress + " disconnected");
        const index = connections.indexOf(connection);
        if (index !== -1)
            connections.splice(index, 1);
    });

    connection.on('message', (message) => {
        console.log("Message: " + message.utf8Data);
        connections.forEach(c => c.sendUTF(message.utf8Data));
    });
});
