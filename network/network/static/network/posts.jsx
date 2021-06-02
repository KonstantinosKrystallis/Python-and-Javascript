// Using the jsx extension, because it easier
//for me to rember, that I have all of my React in this file

class CreatePost extends React.Component {
	constructor(props) {
		super(props);
		this.state = { value: "" };
	}

	CreatePost() {
		let str = document.querySelector("#new-post-content").value.replace(/\s/g, ""); //Regex is very cool
		if (str.length === 0) alert("You must type something");
		else {
			fetch("create", {
				method: "POST",
				body: JSON.stringify({
					content: document.querySelector("#new-post-content").value,
				}),
			}).then((response) => response.json())
				.then((result) => {
					// Print result
					console.log(result);
					document.querySelector("#new-post-content").value = "";
					window.location.reload(); //After the post is created refresh page to see it
				});
		}
	}
	render() {
		return (
			<div id="new-post" className="d-flex justify-content-center align-items-center mb-2">
				<form id="create-post" className="col-6 mt-2">
					<textarea type="text" id="new-post-content" placeholder="What is on your mind?" ></textarea>
					<button id="send-post" type="button" className="btn mt-1 col-auto btn-primary btn-sm" onClick={this.CreatePost}>Post</button>
				</form>
			</div>
		);
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
		fetch(window.location.href, {
			method: 'POST',
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

	like(post) {
		fetch(window.location.href, {
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

	login() {
		//This is called when the user tries to perform an action that requires loggedin status
		window.location.href = '/login';
	}

	render() {
		var { error, isLoaded, posts, page, end, next, prev } = this.state;
		if (error) {
			return <div>Error: {error.message}</div>;
		} else if (!isLoaded) {
			return <div>Loading...</div>;
		} else {
			return (<div>{
				posts.map((post, index) => (
					<div className="mb-2 post" key={index} >
						<div className="post-poster">
							<a href={'/profile/' + post.poster}>{post.poster}</a> posted on {post.timestamp}
							{user === post.poster && <a href={"/edit?post=" + post.id} >Edit</a>}
						</div>
						<div className="post-content">
							{post.content}
						</div>
						<div className="row post-likes">
							<div className="col-auto">{post.liked.length}</div>
							{<div id="like-btn"><i id={'#heart-' + index} className={post.liked.includes(user) ? 'heart fa-heart fas' : 'heart fa-heart far'} aria-hidden="true" onClick={user ? () => this.like(post.id) : () => this.login()}></i></div>}
						</div>
					</div >
				))}
				<div className="d-flex justify-content-center">
					<nav aria-label="Page navigation example">
						<ul className="pagination">
							<li className={page === 1 ? "page-item disabled" : "page-item"}><a className="page-link" href={page > 1 ? '/all/' + 1 : ''}>First</a></li>
							<li className={page === 1 ? "page-item disabled" : "page-item"}><a className="page-link" href={page > 1 ? '/all/' + (page - 1) : ''}>Prev</a></li>
							{page - 2 >= 1 && <li className="page-item"><a className="page-link" href={'/all/' + (page - 2)}>{page - 2}</a></li>}
							{page - 1 >= 1 && <li className="page-item"><a className="page-link" href={'/all/' + (page - 1)}>{page - 1}</a></li>}
							<li className="page-item active"><a className="page-link" href={'/all/' + (page)}>{page}</a></li>
							{page + 1 <= end && <li className="page-item"><a className="page-link" href={'/all/' + (page + 1)}>{page + 1}</a></li>}
							{page + 2 <= end && <li className="page-item"><a className="page-link" href={'/all/' + (page + 2)}>{page + 2}</a></li>}
							<li className={page === end ? "page-item disabled" : "page-item"}><a className="page-link" href={next === true ? '/all/' + (page + 1) : ''}>Next</a></li>
							<li className={page === end ? "page-item disabled" : "page-item"}><a className="page-link" href={next === true ? '/all/' + end : ''}>Last</a></li>
						</ul>
					</nav>
				</div>
			</div>);


		}
	}
}
