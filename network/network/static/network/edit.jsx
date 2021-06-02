class EditPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: "" };
    }

    EditPost() {
        let str = document.querySelector("#new-post-content").value.replace(/\s/g, ""); //Regex is very cool
        let postId = new URL(window.location.href).searchParams.get('post');

        console.log(postId);
        if (str.length === 0)
            alert("You must type something");
        else {
            fetch("edit", {
                method: "POST",
                body: JSON.stringify({
                    content: document.querySelector("#new-post-content").value,
                    id: postId,
                }),
            }).then((response) => response.json())
                .then((result) => {
                    // Print result
                    console.log(result);
                    document.querySelector("#new-post-content").value = "";
                    window.location.href = '/all'; //After the post is created refresh page to see it
                });
        }
    }
    render() {
        return (
            <div id="new-post" className="d-flex justify-content-center align-items-center mb-2">
                <form id="create-post" className="col-6 mt-2">
                    <textarea type="text" id="new-post-content" placeholder="What is on your mind?" >{this.props.content}</textarea>
                    <button id="send-post" type="button" className="btn mt-1 col-auto btn-primary btn-sm" onClick={this.EditPost}>Save</button>
                </form>
            </div>
        );
    }
}