var express = require('express');
var cors = require('cors');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const Game = require("./services/game")
const Player = require("./services/player")

const PORT = process.env.PORT || 4001;;
server.listen(PORT, () => {
  console.log('Server listening at port %d', PORT);
});

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

const games = {};


app.get("/lobby", (req, res) => {
  let rooms = io.sockets.adapter.rooms;
  rooms = Object.keys(rooms).filter(x => x.startsWith("ROOM-")).map(x => {
    return {
      name: x, 
      size: rooms[x].length
    }
  })
  res.json( {
    lobby: rooms
  });
});

io.on('connection', (socket) => {
  socket.on('addPlayer', (data) => {
    let username = data.username;
    let roomId = data.roomId;
    let room = games[roomId];
    let instance = room.instance
    let numUsers = instance.size();
    if(numUsers == 4) {
      socket.disconnect();
      return;
    }
    socket.username = username;
    instance.addPlayer(new Player(numUsers, username, socket.id));
    socket.join(roomId)
    io.to(roomId).emit('state', instance.getState());

    if(instance.canStart()) {
      io.to(room.host).emit('start', true);
    }
  });

  socket.on('createGame', (username) => {
    socket.username = username;
    var instance = new Game();
    let roomId = instance.id
    games[roomId] = {instance: instance, host: socket.id};
    instance.addPlayer(new Player(0, username, socket.id));
    socket.join(roomId)
    io.to(roomId).emit('state', instance.getState());
  });

  socket.on('startGame', (roomId) => {
    if(games.hasOwnProperty(roomId)) {
      let room = games[roomId];
      if(room.host === socket.id) {
        let instance = room.instance;
        instance.startGame();
        
        
        //pull this out to a method
        instance.players.forEach(x => {
          let playerState = instance.getState(x.socketId);
          if(x.socketId === socket.id){
            socket.emit("state", playerState)
          } else {
            socket.to(x.socketId).emit("state", playerState)
          }
        })

      }
    }
  });

  socket.on('playCard', (data) => {
    let instance = games[data.roomId].instance;
    let player = instance.players.find(x => x.socketId === socket.id);
    instance.playCard(player, data.card, data.side);

    instance.players.forEach(x => {
      let playerState = instance.getState(x.socketId);
      if(x.socketId === socket.id){
        socket.emit("state", playerState)
      } else {
        socket.to(x.socketId).emit("state", playerState)
      }
    })
  });

  socket.on('passTurn', (data) => {
    let instance = games[data.roomId].instance;
    let player = instance.players.find(x => x.socketId === socket.id);
    instance.passTurn(player);

    instance.players.forEach(x => {
      let playerState = instance.getState(x.socketId);
      if(x.socketId === socket.id){
        socket.emit("state", playerState)
      } else {
        socket.to(x.socketId).emit("state", playerState)
      }
    })
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    Object.keys(socket.rooms).filter(x => x.startsWith("ROOM-")).forEach(room =>{
      io.to(room).emit('disconnect', {
        username: socket.username,
      });
    })
  });
});