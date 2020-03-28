const _ = require('lodash')

const STATE = require("../data/states") 
const Board = require('./board')
const {Deck, DOUBLESIX} = require('./deck')

class Game {

    constructor(id) {
        this.board = new Board();
        this.players = [];
        this.gameState = STATE.NEW;
        this.id = id
    }

    addPlayer(player) {
        let size = this.size();
        player.id = size;
        if(size <= 4) {
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
            var result = this.board.playCard(card, side)
            if(result) {
                player.removeCard(card);
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

    passTurn(player) {
        if(player.turn && !this.canPlay(player)) {
            this.setNextPlayerTurn();
            return true;
        }
        return false;
    }

    canPlay(player) {
        if(this.board.state.length == 0) {
            return true;
        }
        let sides = player.cards.flatMap(x => [x.left, x.right]);
        return (_.intersection(sides, [this.board.getLeftSide(), this.board.getRightSide()]).length > 0)
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