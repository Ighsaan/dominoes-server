const cards = require('../data/cards')
const DOUBLESIX = cards[cards.length - 1];

class Deck {
    constructor() {
        this.cards = cards;
        this.shuffleDeck()
    }

    shuffleDeck() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    } 

    distributeToPlayers(players) {
        //TODO This needs to be more generic
        players[0].cards = (this.cards.slice(0,7))
        players[1].cards = (this.cards.slice(7,14))
        players[2].cards = (this.cards.slice(14,21))
        players[3].cards = (this.cards.slice(21,28))
        
    }
}

module.exports = {
    Deck: Deck,
    DOUBLESIX: DOUBLESIX
}