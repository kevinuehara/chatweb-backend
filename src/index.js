const express = require('express')
const app = express()
const cors = require('cors')
const http = require('http').Server(app)
const io = require('socket.io')(http)

var clients = []

app.use(cors())

app.get('/', (req, res, next) => {
    res.send('Server is running')
})

io.on("connection", client => {
    client.on("join", name => {
        clients.push({
            username: name,
            id: client.id
        });
        io.emit("update", clients);
        client.broadcast.emit("updateJoinAll", `${name} entrou no chat :D`)
    });

    client.on("send", msg => {
        client.broadcast.emit("chat", msg);
        client.emit("update", clients);
        
    });

    client.on("disconnect", () => {
        if (clients.length > 0) {
            var user = clients.reduce(user => user.id === client.id)
            clients = clients.filter(user => user.id !== client.id)
            io.emit("update", clients);
            io.emit("updateJoinAll", `${user.username} saiu do chat :(`);
        }
    });
});

http.listen(process.env.PORT || 3000)