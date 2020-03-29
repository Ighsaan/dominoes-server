var express = require('express');
var cors = require('cors');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const Player = require("./services/player")
const Pool = require("./services/pool")

const PORT = process.env.PORT || 4001;;
server.listen(PORT, () => {
  console.log('Server listening at port %d', PORT);
});

app.use(cors())
app.use(express.static(path.join(__dirname, 'build')));

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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const init = (io, username, instance, socket) => {
  socket.username = username;
  instance.addPlayer(new Player(username, socket.id));
  socket.join(instance.id);
  io.to(instance.id).emit('state', instance.getState());
}

const broadcastState = (instance, socket) => {
  instance.players.forEach(player => {
    let playerState = instance.getState(player.socketId);
    if(player.socketId === socket.id){
      socket.emit("state", playerState)
    } else {
      socket.to(player.socketId).emit("state", playerState)
    }
  });
}

const pool = new Pool();
io.on('connection', (socket) => {
  
  socket.on('createGame', (username) => {
    let instance = pool.createGame(socket.id).instance;
    init(io, username, instance, socket);
  });

  socket.on('addPlayer', ({ username, roomId }) => {
    let game = pool.getGame(roomId);
    if(!game && game.instance.canStart()) {
      socket.disconnect();
    } else {
      init(io, username, game.instance, socket);
      io.to(game.host).emit('start', game.instance.canStart());
    }
  });

  socket.on('startGame', (roomId) => {
    let game = pool.getGame(roomId);
    if(game && game.isHost(socket.id)) {
      let instance = game.instance;
      instance.startGame();
      broadcastState(instance, socket);
    }
  });

  socket.on('playCard', (data) => {
    let instance = pool.getGame(data.roomId).instance;
    let player = instance.players.find(x => x.socketId === socket.id);
    instance.playCard(player, data.card, data.side);
    broadcastState(instance, socket);
  });

  socket.on('passTurn', (roomId) => {
    let instance = pool.getGame(roomId).instance;
    let player = instance.players.find(x => x.socketId === socket.id);
    if(instance.passTurn(player)){
      broadcastState(instance, socket);
    } //send direct message to client
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