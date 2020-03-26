const Game = require("./services/game")
const Player = require("./services/player")

var instance = new Game();

var player1 = new Player(0, "John")
var player2 = new Player(1, "Joe")
var player3 = new Player(2, "Jack")
var player4 = new Player(3, "Jim")

instance.addPlayer(player1);
console.log(instance.getState());
instance.addPlayer(player2);
instance.addPlayer(player3);
instance.addPlayer(player4);

instance.distributeCards();
instance.startGame();

instance.players.filter(x => x.turn).forEach(x => {
    instance.playCard(x, { left: 6, right: 6 }, "")
})

// console.log(instance.getState().players);
// instance.getState().players.forEach(x => console.log(x.cards));
while(instance.gameState == "PLAYING"){
    instance.players.filter(x => x.turn).forEach(x => {
        var card = x.cards
        .filter(card => instance.board.getLeftSide() == card.left || instance.board.getLeftSide() == card.right )[0];
        var side = "LEFT";
        
        if(!card) {
            card = x.cards
            .filter(card => instance.board.getRightSide() == card.left || instance.board.getRightSide() == card.right )[0];
            side = "RIGHT"
        }
        if(card) {
            instance.playCard(x, card, side)
            console.log(x.name," played ", card.left, "|", card.right);
        } else {
            instance.passTurn(x);
            console.log(x.name, " Klopped");
        }
    });
}

console.log("Game End")
console.log(instance.getState().board.state);

