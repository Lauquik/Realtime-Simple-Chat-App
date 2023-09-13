const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const amqp = require('amqplib');
const redis = require('redis');

const app = express();

const corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));
app.use(express.json());

const RedisClient = redis.createClient({url:'redis://redishost:6379'});

async function publishMessage() {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://guest:guest@rabbithost:5672');
    const channel = await connection.createChannel();

    // Create a queue
    const queue = 'hello';
    await channel.assertQueue(queue, { durable: false });

    // Send a message to the queue
    const message = 'Hello, RabbitMQ Here!';
    channel.sendToQueue(queue, Buffer.from(message));

    console.log(`Message sent: ${message}`);

    // Close the connection
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error(error);
  }
}

publishMessage();


async function mongo(){

  await mongoose.connect("mongodb://mongohost:27017/chatapp")  
  .then(() => {
    console.log("connected to db");
  })
  .catch(e => {
    console.log(e);
  });

  await RedisClient.connect().
  then(()=>{
    console.log("reddis up and running");
  });

}  

mongo();

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const collection = mongoose.model('User', userSchema);


async function verifyUser(userData) {
  try {
      const user = await collection.findOne({ username: userData.username });
      let result = {};
      if (!user) {
        result = { found: false };
      } else {
        result = { found: user.password === userData.password };
      }
      return result;
  } catch (error) {
    console.error(error);
    return { found: false };
  }
}

app.post("/", async (req, res) => {
  try {
    const found = await RedisClient.get(req.body.username);
    if(found!=null) {

      res.json(JSON.parse(found));
    } else {
      const verify = await verifyUser({
        username: req.body.username,
        password: req.body.password,
      });
      RedisClient.setEx(
        req.body.username,
        60,
        JSON.stringify(verify)
      );
      res.json(verify);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(4000, () => {
  console.log("api started on 4000");
});
