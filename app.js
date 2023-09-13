const express = require("express");
const io = require('socket.io')(3000)
const amqp = require('amqplib');

const app = express();

app.use(express.static(__dirname));

async function consumeMessages() {
  try {
    const connection = (await amqp.connect('amqp://rabbithost:5672'));
    const channel = await connection.createChannel();

    const queue = 'hello';
    await channel.assertQueue(queue, { durable: false });

    channel.consume(queue, (message) => {
      console.log(`Received message: ${message.content.toString()}`);
    }, { noAck: true });
  } catch (error) {
    console.error(error);
  }
}
consumeMessages();

app.get("/", (req, res)=>{
    res.sendFile(__dirname+"/index.html");
});

const users = {}

io.on('connection', socket => {
  socket.on('new-user', name => {
    users[socket.id] = name
    socket.broadcast.emit('user-connected', name)
  })
  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    delete users[socket.id]
  })
})


app.listen(8080, ()=>{
  console.log("listening on port 8080");
});
