const urlProf = window.location.pathname;
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
const request = new Request(
    urlProf,
    { headers: { 'X-CSRFToken': csrftoken } }
);

class Search extends React.Component {
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

    searchUser(e) {
        e.preventDefault();
        console.log(e.target);
        fetch(request, {
            method: 'SEARCH',
            mode: 'same-origin',
            body: JSON.stringify({
                username: "a",
            }),
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
        var querry = this.props.data;
        var { error, isLoaded, users } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div className="leaderboard">
                    <div className="scores-head">
                        <div className="pos">Num.</div>
                        <div className="user"> User</div>
                        <div className="score">Score</div>
                    </div >
                    <div className="scores">
                        {
                            users.filter((user) => {
                                if (querry == "")
                                    return user;
                                else if (user.username.includes(querry.toLowerCase())) {
                                    return user
                                }
                            }
                            ).map((user, index) => (
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

