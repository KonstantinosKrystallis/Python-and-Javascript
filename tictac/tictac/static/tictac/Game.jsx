const t = ['X', 'O'];
var complete = false;
var played;

//Warn player if exit is attempted before completion
window.addEventListener('beforeunload', function (e) {
    if (!complete && played) {
        e.preventDefault()
        e.returnValue = '';
    }

});

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            hasPlayed: false,
            timestamp: Date.now(),
            turn: 0,
            playing: t[Math.floor(Math.random() * 2)],
            won: null,
            board: ['', '', '', '', '', '', '', '', ''],
        }
        complete = false;

        this.handleClick = this.handleClick.bind(this);
        this.dismiss = this.dismiss.bind(this);
        //this.calculateWinner = this.calculateWinner.bind(this);
    }

    componentDidMount() {
        this.setState({ turn: 1 });
    }

    componentDidUpdate() {
        this.nowPlaying();
        console.log(this.state);
        if (this.state.won != null || this.state.turn == 10)
            complete = true;
        played = this.state.hasPlayed;
        //If the game is done (win, loss, tie) 'lock' the game board
        //else continue playing
        if (this.state.won != null) {
            document.getElementById("game-board").classList.add("game-done");
            if (user != "")
                this.gameDone();
        } else {
            this.nextTurn();
        }
        if (user != "")
            this.updateGame();
    }

    //Let's the player make their move
    handleClick(e) {
        if (e.target.innerHTML === '') {
            e.target.classList.add('clicked');
            let player = this.state.playing;
            if (player === 'X') {
                e.target.innerHTML = player;
                this.state.board[e.target.id] = player;
                this.setState({ hasPlayed: true, playing: 'O', turn: this.state.turn + 1 });
            }
            else if (player === 'O') {
                e.target.innerHTML = player;
                this.state.board[e.target.id] = player;
                this.setState({ playing: 'X', turn: this.state.turn + 1 });
            }
        }
    }

    //Handle win scenarios and let the AI player make it's move
    nextTurn() {
        let result = this.calculateWinner(this.state.board);
        //This handles win scenarios for both players
        //If there is a winning combination highlight it
        if (result) {
            for (let index = 0; index < result.length; index++) {
                let id = result[index];
                if (this.state.board[result[index]] == 'X') {
                    document.getElementById(id).classList.add("winner");
                    if (this.state.won == null)
                        this.setState({ won: "Won" });
                } else {
                    document.getElementById(id).classList.add("loser");
                    if (this.state.won == null)
                        this.setState({ won: "Lost" });
                }
            }
        } else {
            //This handles ties
            if (this.state.turn == 10 && this.state.won == null) {
                this.setState({ won: "Tie" });
            }
            this.aiMove();
        }


    }

    //This makes AI player make their move
    aiMove() {
        if (this.state.playing === 'O' && this.state.turn < 10 && this.state.won == null) {
            gameboard = this.state.board;
            let index = null;
            // On the first 2 of the AI it will randomly select a valid move
            if (this.state.turn < 5) {
                index = randomMove();
            }
            // Then it will play the best move possible
            else {
                index = bestMove();
            }
            if (index !== null) {
                this.setState({
                    board: gameboard,
                    playing: 'X',
                    turn: this.state.turn + 1,
                });
                document.getElementById(index).innerHTML = 'O';
                document.getElementById(index).classList.add("clicked");
            }
        }
    }

    //Update the interface with information on the state of the game
    nowPlaying() {
        // console.log(this.state);
        if (this.state.won == null) {
            if (this.state.playing == 'X') {
                document.getElementById("playing").innerHTML = "It's your turn!";
            } else if (this.state.playing == 'O') {
                //This is here in case the AI takes a longer time to make it's move
                document.getElementById("playing").innerHTML = "It's your opponent's turn!";
            }
        }
        else {
            if (this.state.won == "Won") {
                document.getElementById("playing").innerHTML = "You won!";
            } else if (this.state.won == "Lost") {
                document.getElementById("playing").innerHTML = "You lost :(.";
            } else if (this.state.won == "Tie") {
                document.getElementById("playing").innerHTML = "It's a tie...";
            }
        }
    }

    //This finds the winning combination and returns the positions of the winning squares
    calculateWinner(board) {
        const win_states = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        for (let i = 0; i < win_states.length; i++) {
            const [a, b, c] = win_states[i];
            if (board[a] != '' && board[a] == board[b] && board[b] == board[c]) {
                return win_states[i];
            }
        }
        return null;
    }

    //Updates the server on the current state of the game
    async updateGame() {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const request = new Request(
            "game",
            { headers: { 'X-CSRFToken': csrftoken } }
        );
        //Once player has made a move store the game with default state as lost
        //Then every turn update the state of the stored game until completion
        if (played && !complete) {
            let srv_rsp = await fetch(request, {
                method: "POST",
                mode: 'same-origin',
                body: JSON.stringify({
                    timestamp: this.state.timestamp,
                    hasPlayed: this.state.hasPlayed,
                    turn: this.state.turn - 1,
                    won: this.state.won != null ? this.state.won : "Lost",
                    done: complete,
                }),
            }).then((response) => response.json())
                .then((result) => {
                    //console.log(result);
                });
        }
    }

    //Updates the interface with the result of game & notifies server of end result
    async gameDone() {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const request = new Request(
            "game",
            { headers: { 'X-CSRFToken': csrftoken } }
        );
        //send result of game to server
        let srv_rsp = await fetch(request, {
            method: "POST",
            mode: 'same-origin',
            body: JSON.stringify({
                timestamp: this.state.timestamp,
                hasPlayed: this.state.hasPlayed,
                turn: this.state.turn - 1,
                won: this.state.won,
                done: complete,
            }),
        }).then((response) => response.json())
            .then((result) => {
                console.log(result);
            });
    }

    //Used to unmount the component
    dismiss() {
        this.props.unmountMe();
    }

    render() {
        return (
            <div key={this.state.timestamp} id="game" >
                <div id="playing" >
                </div>
                <div id="game-board">
                    <div id="0" className="game-tile" onClick={this.handleClick}></div>
                    <div id="1" className="game-tile" onClick={this.handleClick}></div>
                    <div id="2" className="game-tile" onClick={this.handleClick}></div>
                    <div id="3" className="game-tile" onClick={this.handleClick}></div>
                    <div id="4" className="game-tile" onClick={this.handleClick}></div>
                    <div id="5" className="game-tile" onClick={this.handleClick}></div>
                    <div id="6" className="game-tile" onClick={this.handleClick}></div>
                    <div id="7" className="game-tile" onClick={this.handleClick}></div>
                    <div id="8" className="game-tile" onClick={this.handleClick}></div>
                </div>
                {(this.state.won != null || (this.state.turn == 10 && this.state.won == null)) && <div id="reset" onClick={this.dismiss}><div id="new-game">New Game</div> </div>}
                {    user != ""
                    ? (this.state.hasPlayed && (this.state.won == null && this.state.turn < 10)) &&
                    <div id="rules" >
                        If you leave this page, before the game is complete, it will count as your loss.
                    </div>
                    : <div id="rules" >
                        You are not logged in! Game result will not be stored.
                    </div>
                }

            </div >
        );
    }
}

class Controler extends React.Component {
    constructor(props) {
        super(props)
        this.state = { renderChild: true };
        this.handleChildUnmount = this.handleChildUnmount.bind(this);
    }

    componentDidUpdate() {
        if (!this.state.renderChild)
            this.setState({ renderChild: true });
    }

    handleChildUnmount() {
        this.setState({ renderChild: false });
    }
    render() {
        return (
            <div className="container">
                { this.state.renderChild ? <Game unmountMe={this.handleChildUnmount} /> : null}
            </div>
        );
    }
}

//=====================================================
//Everything below this point is used for the AI player 
//=====================================================

const human = 'X';
const ai = 'O';
var gameboard;
let scores = {
    X: -1,
    O: 1,
    tie: 0
};

function checkWinner() {
    const win_states = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    let winner = null;

    //Check all possible winning combinations
    for (let i = 0; i < win_states.length; i++) {
        const [a, b, c] = win_states[i];
        if (gameboard[a] != '' && gameboard[a] == gameboard[b] && gameboard[b] == gameboard[c]) {
            winner = gameboard[a];
        }
    }

    //Check for ties
    let openSpots = 0;
    for (let i = 0; i < 9; i++) {
        if (gameboard[i] == '') {
            openSpots++;
        }
    }

    //Return result
    if (winner == null && openSpots == 0) {
        return 'tie';
    } else {
        return winner;
    }
}

function randomMove() {
    let done = false;
    let move = null;
    while (!done) {
        move = Math.floor(Math.random() * 8);
        if (gameboard[move] == '') {
            gameboard[move] = ai;
            done = true;
        }
    }
    return move;
}

function bestMove() {
    // AI to make its turn
    let bestScore = -Infinity;
    let move = null;
    for (let i = 0; i < 9; i++) {
        // Is the spot available?
        if (gameboard[i] == '') {
            gameboard[i] = ai;
            let score = minimax(gameboard, 0, false);
            gameboard[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    gameboard[move] = ai;
    return move;
}

function minimax(board, depth, isMaximizing) {

    let result = checkWinner();
    if (result != null) {
        return scores[result];
    }
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] == '') {
                board[i] = ai;
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] == '') {
                board[i] = human;
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}