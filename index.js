let express = require("express");
let cors = require("cors");
let http = require("http");
let {Server} = require("socket.io");


let app = express();
app.use(cors());
let server = http.createServer(app);

///socket.io
const io = new Server(server,{
    cors:{
        origin:"*",
        methods:['GET','POST'],
        allowedHeaders:['Content-Type']
    }
});


let waitingUser = null;

io.on('connection', (socket) => {
    console.log(socket.id)
    
    if (waitingUser) {
        // Pair the new user with the waiting user
        socket.emit('paired', { partnerId: waitingUser.id });
        waitingUser.emit('paired', { partnerId: socket.id });

        // Reset the waiting user
        waitingUser = null;
    } else {
        // If no one is waiting, set this user as the waiting user
        waitingUser = socket;
    }

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // If the waiting user disconnects, reset the waiting user
        if (waitingUser === socket) {
            waitingUser = null;
        }
    });

    socket.on("ids",(data)=>{
        console.log(data.partnerId);
        io.to(data.partnerId).emit("userpeer",data.peerId)
    })
});

///basic api's
app.get("/",(req,resp)=>{
    resp.send({result:"hello world from server"})
})

server.listen(1010,()=>{
    console.log("server started")
});
