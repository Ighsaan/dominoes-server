const _ = require("lodash")
const sides = require("../data/sides")

class Board {
    constructor() {
        this.state = []
    }

    playCard(card, side) {
        if(_.isEmpty(this.state)) {
            this.state.push({
                card: card,
                initialCard: true
            });
            return true;
        }
        if(side == sides.LEFT) {
            let isLeft = card.left == this.getLeftSide();
            let isRight = card.right == this.getLeftSide()
            let face = isLeft ? card.right : isRight ? card.left : null;
            if(face) {
                this.state.unshift({
                    card: card,
                    face: face
                })
                return true;
            }
        }

        if(side == sides.RIGHT) {
            var isLeft = card.left == this.getRightSide();
            var isRight = card.right == this.getRightSide();
            let face = isLeft ? card.right : isRight ? card.left : null;
            if(face) {
                this.state.push({
                    card: card,
                    face: face
                })
                return true;
            }
        }
        return false;
    }

    getLeftSide(){
        var leftCard = _.first(this.state);
        return leftCard.initialCard == true ?  leftCard.card.left : leftCard.face;
    }

    getRightSide(){
        var rightCard = _.last(this.state);
        return rightCard.initialCard == true ? rightCard.card.right : rightCard.face
    }

    getState(){
        return {
            state: this.state
        }
    }
}

module.exports = Board