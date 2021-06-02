class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            profile: null,
        };
    }

    componentDidMount() {
        this.getProfile(); //Get posts on first load
    }

    getProfile() {
        fetch(window.location.pathname, {
            method: 'USER',
        })
            .then((res) => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        profile: result,
                    });
                    myStorage.setItem('prof', this.state.profile.username);
                    console.log(myStorage.prof);
                    if (user && user !== this.state.profile.username) // if the user is looking at their own profile there is no need to check for a follow button
                        if (this.state.profile.followed.includes(user)) {
                            console.log('followed');
                            document.querySelector('#follow').classList.add('followed');
                            document.querySelector('#follow').classList.add('btn-outline-primary');
                            document.querySelector('#follow').innerHTML = "Unfollow";
                        }
                        else {
                            console.log('not followed');
                            document.querySelector('#follow').innerHTML = "Follow";
                            document.querySelector('#follow').classList.add('btn-primary');
                        }

                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error,
                    });
                }
            );
    }

    follow() {
        document.querySelector('#follow').classList.toggle('followed');
        if (document.querySelector('#follow').classList.contains('followed')) {
            document.querySelector('#follow').innerHTML = "Unfollow";
            document.querySelector('#follow').classList.toggle('btn-primary');
            document.querySelector('#follow').classList.toggle('btn-outline-primary');
            console.log('follow');
        } else {
            document.querySelector('#follow').innerHTML = "Follow";
            document.querySelector('#follow').classList.toggle('btn-primary');
            document.querySelector('#follow').classList.toggle('btn-outline-primary');
            console.log('unfollow');
        }
        fetch(window.location.pathname, {
            method: 'FOLLOW',
        }).then((res) => res.json())
            .then((result) => {
                this.setState({
                    isLoaded: true,
                    profile: result,
                });
                console.log(this.state.isLoaded);
            }, (error) => {
                this.setState({
                    isLoaded: true,
                    error,
                });
            });
    }

    render() {
        const { error, isLoaded, profile } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div className="mt-2 mb-2 row pos" key={profile.id}>
                    <div className="col-auto profile-user">
                        {profile.username} {user && user !== profile.username && <button id="follow" className="btn btn-sm" onClick={() => this.follow()}></button>}
                    </div>
                    <div className="col-auto profile-following">
                        <div className="">Following: <span id="count-following"> {profile.following.length}</span></div>
                    </div>
                    <div className="col-auto profile-followed">
                        <div className="">Followed: <span id="count-followers">{profile.followed.length}</span></div>
                    </div>
                </div>
            );
        }
    }
}

class Post extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            posts: [],
            page: null,
            end: null,
            next: null,
            prev: null,
        };
    }

    componentDidMount() {
        this.getPost(); //Get posts on first load
        this.UpdateTimer = setInterval(
            () => this.getPost(),
            (5 * 60 * 1000) // Automaticly refresh posts every 5 mins
        );
    }

    getPost() {
        console.log(window.location.pathname)
        fetch(window.location.pathname, {
            method: 'POST',
        })
            .then((res) => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        posts: result.posts,
                        page: result.page,
                        end: result.end,
                        next: result.hasNext,
                        prev: result.hasPrevious,
                    });
                    myStorage.setItem('page', this.state.page);
                    myStorage.setItem('end', this.state.end);
                    myStorage.setItem('next', this.state.next);
                    myStorage.setItem('prev', this.state.prev);

                    console.log('page: ' + this.state.page);
                    console.log('end: ' + this.state.end);
                    console.log('next: ' + this.state.next);
                    console.log('prev: ' + this.state.prev);
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error,
                    });
                }
            );
    }


    like(post) {
        fetch(window.location.pathname, {
            method: 'LIKE',
            body: JSON.stringify({
                post: post,
            }),
        }).then((res) => res.json())
            .then((result) => {
                this.setState({
                    isLoaded: true,
                    posts: result.posts,
                    page: result.page,
                    end: result.end,
                    next: result.hasNext,
                    prev: result.hasPrevious,
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
        const { error, isLoaded, posts, page, end, next, prev } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (<div>{
                posts.map((post, index) => (
                    <div className="mb-2 post" key={index}>
                        <div className="post-poster">
                            {user === post.poster ? 'You' : post.poster} posted on {post.timestamp}
                            <a href={"/edit?post=" + post.id} >Edit</a>
                        </div>
                        <div className="post-content">
                            {post.content}
                        </div>
                        <div className="row post-likes">
                            <div className="col-auto">{post.liked.length}</div>
                            <div id="like-btn"><i id={'#heart-' + index} className={post.liked.includes(user) ? 'heart fa-heart fas' : 'heart fa-heart far'} aria-hidden="true" onClick={() => this.like(post.id)}></i></div>
                        </div>
                    </div>
                ))}
                <div className="d-flex justify-content-center">
                    <nav aria-label="Page navigation example">
                        <ul className="pagination">
                            <li className={page === 1 ? "page-item disabled" : "page-item"}><a className="page-link" href={page > 1 ? '/profile/' + myStorage.prof + '/' + 1 : ''}>First</a></li>
                            <li className={page < 2 ? "page-item disabled" : "page-item"}><a className="page-link" href={page > 1 ? '/profile/' + myStorage.prof + '/' + (page - 1) : ''}>Prev</a></li>
                            {page - 2 >= 1 && <li className="page-item"><a className="page-link" href={'/profile/' + myStorage.prof + '/' + (page - 2)}>{page - 2}</a></li>}
                            {page - 1 >= 1 && <li className="page-item"><a className="page-link" href={'/profile/' + myStorage.prof + '/' + (page - 1)}>{page - 1}</a></li>}
                            <li className="page-item active"><a className="page-link" href={'/profile/' + myStorage.prof + '/' + (page)}>{page}</a></li>
                            {page + 1 <= end && <li className="page-item"><a className="page-link" href={'/profile/' + myStorage.prof + '/' + (page + 1)}>{page + 1}</a></li>}
                            {page + 2 <= end && <li className="page-item"><a className="page-link" href={'/profile/' + myStorage.prof + '/' + (page + 2)}>{page + 2}</a></li>}
                            <li className={page >= end ? "page-item disabled" : "page-item"}><a className="page-link" href={next === true ? '/profile/' + myStorage.prof + '/' + (page + 1) : ''}>Next</a></li>
                            <li className={page === end ? "page-item disabled" : "page-item"}><a className="page-link" href={next === true ? '/profile/' + myStorage.prof + '/' + end : ''}>Last</a></li>
                        </ul>
                    </nav>
                </div>
            </div >);

        }
    }
}
