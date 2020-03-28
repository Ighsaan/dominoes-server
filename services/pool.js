const Game = require("./game")
const Room = require("./room")

const ROOM_ID_PREFIX = "ROOM-";

class Pool {
    constructor() {
        this.games = {};
    }

    getGame(roomId) {
        return this.games[roomId];
    }

    createGame(hostId){
        let id = this.generateNewGameId()
        var instance = new Game(id);
        let gameData = new Room(instance, hostId);
        this.games[id] = gameData
        return gameData;
    }

    hasGame(id) {
        return this.games.hasOwnProperty(id)
    }

    generateNewGameId() {
        return ROOM_ID_PREFIX + Math.floor(Math.random() * (9999 - 1000) + 1000)
    }
}

module.exports = Pool;