class Leaderboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            users: null,
        }
    }


    componentDidMount() {
        this.getLeaderboard();
    }

    componentDidUpdate() {

    }

    getLeaderboard() {
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
                    users: result.users,
                });
            }, (error) => {
                this.setState({
                    isLoaded: true,
                    error,
                });
            }
            );
    }

    render() {
        var { error, isLoaded, users } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div className="leaderboard">
                    <div className="scores-head">
                        <div className="pos">Rank</div>
                        <div className="user"> User</div>
                        <div className="score">Score</div>
                    </div >
                    <div className="scores">
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
                    </div>

                </div>);
        }
    }
}