const urlProf = window.location.pathname;
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
const request = new Request(
    urlProf,
    { headers: { 'X-CSRFToken': csrftoken } }
);

class ControlPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            users: null,
            games: null,
            showUsers: false,
            showGames: false,
        }
        this.createTestUsers = this.createTestUsers.bind(this);
        this.deleteTestUsers = this.deleteTestUsers.bind(this);
        this.createTestGames = this.createTestGames.bind(this);
        this.deleteTestGames = this.deleteTestGames.bind(this);
        this.getAllUsers = this.getAllUsers.bind(this);
        this.getAllGames = this.getAllGames.bind(this);
    }


    componentDidMount() {
        this.getControlPanel();
    }

    componentDidUpdate() {

    }

    getControlPanel() {
        fetch(request, {
            method: 'POST',
            mode: 'same-origin',
        }).then((res) => res.json())
            .then((result) => {
                this.setState({
                    isLoaded: true,
                });
                console.log(result);
            }, (error) => {
                this.setState({
                    isLoaded: true,
                    error,
                });
            }
            );
    }

    createTestUsers() {
        fetch(request, {
            method: 'CREATE',
            mode: 'same-origin',
        }).then((res) => res.json())
            .then((result) => {
                this.setState({
                    isLoaded: true,
                });
                console.log(result);
            }, (error) => {
                this.setState({
                    isLoaded: true,
                    error,
                });
            }
            );
    }

    deleteTestUsers() {
        fetch(request, {
            method: 'DELETE',
            mode: 'same-origin',
        }).then((res) => res.json())
            .then((result) => {
                this.setState({
                    isLoaded: true,
                });
                console.log(result);
            }, (error) => {
                this.setState({
                    isLoaded: true,
                    error,
                });
            }
            );
    }

    createTestGames() {
        fetch(request, {
            method: 'MAKE',
            mode: 'same-origin',
            body: JSON.stringify({
                timestamp: Date.now(),
            })
        }).then((res) => res.json())
            .then((result) => {
                this.setState({
                    isLoaded: true,
                });
                console.log(result);
            }, (error) => {
                this.setState({
                    isLoaded: true,
                    error,
                });
            }
            );
    }

    deleteTestGames() {
        fetch(request, {
            method: 'UNMAKE',
            mode: 'same-origin',
        }).then((res) => res.json())
            .then((result) => {
                this.setState({
                    isLoaded: true,
                });
                console.log(result);
            }, (error) => {
                this.setState({
                    isLoaded: true,
                    error,
                });
            }
            );
    }

    getAllUsers() {
        if (this.state.showGames) {
            this.state.showGames = false;
            this.state.games = null;
        }

        if (!this.state.showUsers) {
            fetch(request, {
                method: 'USERS',
                mode: 'same-origin',
            }).then((res) => res.json())
                .then((result) => {
                    this.setState({
                        isLoaded: true,
                        users: result.content,
                        showUsers: true,
                    });
                    console.log(result);
                }, (error) => {
                    this.setState({
                        isLoaded: true,
                        error,
                    });
                }
                );
        } else {
            this.setState({
                showUsers: false,
                users: null,
            });
        }

    }

    getAllGames() {
        if (this.state.showUsers) {
            this.state.showUsers = false;
            this.state.users = null;
        }

        if (!this.state.showGames) {
            fetch(request, {
                method: 'GAMES',
                mode: 'same-origin',
            }).then((res) => res.json())
                .then((result) => {
                    this.setState({
                        isLoaded: true,
                        games: result.content,
                        showGames: true,
                    });
                    console.log(result);
                }, (error) => {
                    this.setState({
                        isLoaded: true,
                        error,
                    });
                }
                );
        } else {
            this.setState({
                showGames: false,
                games: null,
            });
        }

    }

    render() {
        var { error, isLoaded, users, games } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (<div className="debug-panel">
                <div className="header">This panel is only available to  logged in admins.</div>
                <div className="controls">
                    <div className="btn-test" onClick={this.createTestUsers}>Create test users</div>
                    <div className="btn-test" onClick={this.deleteTestUsers}>Delete test users</div>
                    <div className="btn-test" onClick={this.createTestGames}>Create test games</div>
                    <div className="btn-test" onClick={this.deleteTestGames}>Delete test games</div>
                    <div className="btn-test" onClick={this.getAllUsers}>{!this.state.showUsers ? "Show all users" : "Hide all users"}</div>
                    <div className="btn-test" onClick={this.getAllGames}>{!this.state.showGames ? "Show all games" : "Hide all games"}</div>

                </div >
                {this.state.showUsers && <div className="users">
                    {
                        users.map((user, index) => (
                            <div key={index} className="score">
                                <a href={"/profile/" + user.username}>
                                    <div className="pos">{index + 1}.</div>
                                    <div className="user">{user.username}</div>
                                    <div className="score">{abbrNum(user.score, 2)}</div>
                                </a>
                            </div >
                        ))
                    }
                </div>}
                {this.state.showGames && <div className="games">
                    <div className={"game-head"}>
                        <div className="time">Datetime | User</div>
                        <div className="turn">Turn</div>
                        <div className="won">Result</div>
                        <div className="done">Completion</div>
                    </div >
                    {
                        games.map((game, index) => (
                            <div key={index} className={"game " + game.won}>
                                <div className="time">{transformDate(game.timestamp) + " | " + game.player}</div>
                                <div className="turn">{game.turn}</div>
                                <div className="won">{game.won}</div>
                                <div className="done">{game.done ? "Complete" : "DNF"}</div>
                            </div >
                        ))
                    }
                </div>}
            </div>


            );
        }
    }
}