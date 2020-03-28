const _ = require("lodash")

class Player {
    constructor(name, socketId) {
        this.id = -1;
        this.name = name;
        this.socketId = socketId;
        this.cards = [];
        this.down = false;
        this.turn = false;
        this.winner = false;
    }

    hasCard(card) {
        return _.find(this.cards, x => x.left == card.left && x.right == card.right)
    }

    removeCard(card) {
        this.cards.splice(this.cards.indexOf(card), 1);
    }

    getState(isPlayer) {
        let data =  {
            id: this.id,
            name: this.name,
            socketId: this.socketId,
            down: this.down,
            turn: this.turn,
            winner: this.winner
        }
        if(isPlayer) {
            data.cards = this.cards;
            data.isYou = true;
        }
        else {
            data.count = this.cards.length;
        }
        return data;
    }
}



module.exports = Player;