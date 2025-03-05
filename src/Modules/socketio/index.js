import { Server } from "socket.io";
import { sendMessage } from "./chatting/chat.service.js";
import { socketAuth } from "./middlewares/socket.auth.middleware.js";


export const runSocket = function (server) {
    const io = new Server(server,{
        cors: {
          origin: "*",
        }
    })

    io.use(socketAuth)
    
    io.on("connection", (socket) => {
        console.log("new user connected", socket.id);

        socket.on("sendMessage", sendMessage(socket,io))
      });
}