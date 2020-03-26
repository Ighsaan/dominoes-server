const _ = require('lodash')

const STATE = require("../data/states") 
const Board = require('./board')
const {Deck, DOUBLESIX} = require('./deck')

const ROOM_ID_PREFIX = "ROOM-";
class Game {

    constructor() {
        this.board = new Board();
        this.players = [];
        this.gameState = STATE.NEW;
        this.id = ROOM_ID_PREFIX + Math.floor(Math.random() * (9999 - 1000) + 1000)
    }

    addPlayer(player) {
        if(this.players.length <= 4) {
            this.players.push(player)
            this.gameState = STATE.WAITING
        }
    }

    distributeCards() {
        var deck = new Deck();
        deck.distributeToPlayers(this.players);
        this.determineDown()
    }

    determineDown() {
        this.players.forEach(player => {
            if(player.hasCard(DOUBLESIX)) {
                player.down = true;
                player.turn = true;
            }
        })
    }

    startGame() {
        this.distributeCards();
        this.gameState = STATE.PLAYING;
    }

    playCard(player, card, side) {
        card = player.hasCard(card);
        if(player.turn && card) {
            player.removeCard(card);
            var result = this.board.playCard(card, side)
            if(result) {
                if(this.isRoundFinish()) {
                    this.gameState = STATE.END
                } else {
                    this.setNextPlayerTurn();
                }
            }
            return result;
        }
        return false;
    }

    passTurn() {
        this.setNextPlayerTurn();
    }

    isRoundFinish() {
        var winner = _.find(this.players, x => x.cards.length == 0);
        if(winner) {
            winner.winner = true;
        }

        return winner;
    }

    setNextPlayerTurn() {
        var found =false;
        var set = false;
        while (!found || !set) {
            this.players.forEach(x => {
                if(found && !set) {
                    x.turn = true;
                    set = true;
                }
                else if(x.turn) {
                    x.turn = false;
                    found = true;
                }
            });
            
        }
    }

    size() {
        return this.players.length;
    }

    canStart() {
        return this.players.length === 4;
    }

    getState(socketId) {
        let playerData = this.players;
        if(socketId) {
            playerData = this.players.map(x => {
                return x.getState(x.socketId === socketId);
            });

            let index = playerData.findIndex(x => x.socketId === socketId);
            playerData = playerData.slice(index).concat(playerData.slice(0, index))
        }
        return {
            id: this.id,
            board: this.board.getState(),
            players: playerData,
            gameState: this.gameState
        }
    }
}

module.exports = Game