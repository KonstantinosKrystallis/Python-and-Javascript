class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            content: null,
            watched: false,
        }
    }


    componentDidMount() {
        this.getProfile()

    }

    componentDidUpdate() {

    }

    getProfile() {
        let urlProf = window.location.pathname;
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const request = new Request(
            urlProf,
            { headers: { 'X-CSRFToken': csrftoken } }
        );
        fetch(request, {
            method: 'POST',
            mode: 'same-origin',
        }).then((res) => res.json())
            .then((result) => {
                this.setState({
                    isLoaded: true,
                    content: result.content,
                    watched: result.watched
                });
            }, (error) => {
                this.setState({
                    isLoaded: true,
                    error,
                });
            }
            );
    }

    watchUnwatch(e) {
        let urlProf = window.location.pathname;
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const request = new Request(
            urlProf,
            { headers: { 'X-CSRFToken': csrftoken } }
        );
        fetch(request, {
            method: 'WATCH',
            mode: 'same-origin',
        }).then((res) => res.json())
            .then((result) => {
                this.setState({
                    isLoaded: true,
                    content: result.content,
                });
            }, (error) => {
                this.setState({
                    isLoaded: true,
                    error,
                });
            }
            );
        e.target.classList.toggle("fa-eye");
        e.target.classList.toggle("fa-eye-slash");
        console.log(e.target.classList);
    }

    countResults(res, arr) {
        var count = 0;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].won == res)
                count++;
        }
        return count;
    }

    render() {
        var { error, isLoaded, content, watched } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div className="profile">
                    <div className="profile-header">
                        {user == content.username
                            ? <div><i className="far fa-eye-slash"></i></div>
                            : <div><i className={watched ? "fas fa-eye-slash" : "fas fa-eye"} onClick={this.watchUnwatch}></i></div>
                        }
                        <div>
                            <div className="user">{user == content.username ? "You" : content.username}</div>
                            <div className="score">Score: {abbrNum(content.score, 2)}</div>
                        </div>
                        <div>
                            Games Played: {content.games.length}
                        </div>
                        <div>
                            <div>Wins: {this.countResults('Won', content.games)}</div>
                            <div>Losses: {this.countResults('Lost', content.games)}</div>
                            <div>Ties: {this.countResults('Tie', content.games)}</div>
                        </div>
                    </div >
                    <div className="games">
                        <div className={"game-head"}>
                            <div className="time">Datetime</div>
                            <div className="turn">Turn</div>
                            <div className="won">Result</div>
                            <div className="done">Completion</div>
                        </div >
                        {
                            content.games.map((game, index) => (
                                <div key={index} className={"game " + game.won}>
                                    <div className="time">{transformDate(game.timestamp)}</div>
                                    <div className="turn">{game.turn}</div>
                                    <div className="won">{game.won}</div>
                                    <div className="done">{game.done ? "Complete" : "DNF"}</div>
                                </div >
                            ))
                        }
                    </div>
                </div >
            );
        }
    }
}