const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express()

const server = http.createServer(app)
const io = socketio(server)

let list = {}
let sockets = []
io.on("connection", function (socket){
    console.log("Socket connected :" + socket.id)
    list[socket.id] = 0
    sockets.push(socket.id)

    socket.emit("update",{
        list: list,
        socketList: sockets
    })

    socket.on("update",(message) => {
        list[socket.id] = Math.max(message.currentScore,list[socket.id])

        for(let i=0;i<sockets.length;i++){
            for(let j=1;j<sockets.length-i;j++){
                if(list[sockets[j]]>list[sockets[j-1]]){
                    let temp = sockets[j];
                    sockets[j] = sockets[j-1];
                    sockets[j-1] = temp;
                }
            }
        }
        socket.emit("update",{
            list: list,
            socketList: sockets
        })
        socket.broadcast.emit("update",{
            list: list,
            socketList: sockets
        })
    })
    socket.on('disconnect',() => {
        console.log("disconnected :" + socket.id)
        temp = {}
        for(let i=0;i<sockets.length;i++){
            if(sockets[i] !== socket.id) {
                temp[sockets[i]] = list[sockets[i]]
            }else{
                sockets.splice(i,1)
                i--
            }
        }
        list = temp;
        socket.broadcast.emit("update",{
            list: list,
            socketList: sockets
        })
    })

})

app.use('/',express.static(__dirname + '/public'))


server.listen(9999,() => {
    console.log("connected to server on port http://local:9999")
})