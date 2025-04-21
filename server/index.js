const express = require('express');
const bodyparser = require('body-parser')
const cors = require('cors')
const { Server } = require('socket.io')

const app = express();
app.use(bodyparser.json());
app.use(cors())

const io = new Server({
    cors: true
});

const emailToSocketMapping = new Map()
const socketToEmailMapping = new Map();

io.on('connection', socket => {
    console.log("New Connection joined at " + new Date().toLocaleTimeString() + ' ' + new Date().getMilliseconds())
    socket.on('join-room', data => {
        const { roomId, emailId } = data;
        console.log("User with " + emailId + " joined the room with roomId " + roomId + " at " + new Date().toLocaleTimeString() + ' ' + new Date().getMilliseconds())
        emailToSocketMapping.set(emailId, socket.id)
        socketToEmailMapping.set(socket.id, emailId)
        socket.join(roomId)
        socket.emit('joined-room', { roomId })
        socket.broadcast.to(roomId).emit('user-joined', { emailId })
    })

    socket.on('call-user', data => {
        const { emailId, offer } = data;
        console.log("email Id in call-user "+emailId)
        const fromEmail = socketToEmailMapping.get(socket.id)
        const socketId = emailToSocketMapping.get(emailId)
        console.log("CAll user from " + fromEmail + " with offer at " + new Date().toLocaleTimeString() + ' ' + new Date().getMilliseconds())

        socket.to(socketId).emit('incomming-call', { from: fromEmail, offer })
    })

    socket.on('call-accepted', data => {
        const { emailId, ans } = data
    
        const socketId = emailToSocketMapping.get(emailId)
        socket.to(socketId).emit('call-accepted', { ans })
        console.log("CAll accepted of " + emailId + " with ans at " + new Date().toLocaleTimeString() + ' ' + new Date().getMilliseconds())

    })

})



app.listen(8000, () => {
    console.log('HTTP server is running at port 8000');
})

io.listen(8001, () => {
    console.log("Socket server running at port 8001");
})

