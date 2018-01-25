const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express()

var port = process.env.PORT || 9999;

const server = http.createServer(app)
const io = socketio(server)

let list = {}
let sockets = []
io.on("connection", function (socket){
    console.log("Socket connected :" + socket.id)

    // socket.on("ask-username",(message) => {
    //     socket.emit("ask-username",{
    //
    //     })
    // })

    socket.emit("ask-username",{
        name: ""
    })

    let temp = 0;
    //testing
    socket.on("username",(message) => {
        list[socket.id] = {score: temp,name: "",pos:0}
        sockets.push(socket.id)
        list[socket.id].pos=sockets.length;
        list[socket.id].name = message.name;
        socket.emit("update",{
            list: list,
            socketList: sockets,
        })
        socket.broadcast.emit("update",{
            list: list,
            socketList: sockets
        })
    })




    socket.on("update",(message) => {
        if(list[socket.id])
            list[socket.id].score = Math.max(message.currentScore,list[socket.id].score)
        else
            temp++;
        for(let i=0;i<sockets.length;i++){
            for(let j=1;j<sockets.length-i;j++){
                if(list[sockets[j]].score>list[sockets[j-1]].score){
                    let temp = sockets[j];
                    list[sockets[j]].pos --;
                    list[sockets[j-1]].pos++;
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


server.listen(port,() => {
    console.log("connected to server on port http://local:9999")
})