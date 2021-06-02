document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#send').addEventListener('click', () => { send(); setTimeout(() => { load_mailbox('sent'); }, 100); });
  // By default, load the inbox 
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function compose_reply(id) { //function overload

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';


  fetch("/emails/" + id)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);
      // ... do something else with email ...
      document.querySelector('#compose-recipients').value = email.sender;
      if (email.subject.includes('Re:'))
        document.querySelector('#compose-subject').value = email.subject;
      else
        document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
      document.querySelector('#compose-body').value =
        '---Start of Reply---\n\n' + 'Write your response here\n\n' + '---End of Reply---\n\n' +
        'On ' + email.timestamp + ' ' + email.sender + ' wrote:\n' + email.body;
    });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (mailbox === 'inbox') {
    fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {
        // Print emails
        console.log(emails);
        // ... do something else with emails ...
        emails.forEach(email => {
          add_emails(email);
        });
      });
  } else if (mailbox === 'sent') {
    fetch('/emails/sent')
      .then(response => response.json())
      .then(emails => {
        // Print emails
        console.log(emails);
        // ... do something else with emails ...
        emails.forEach(email => {
          add_emails(email);
        });
      });
  } else if (mailbox === 'archive') {
    fetch('/emails/archive')
      .then(response => response.json())
      .then(emails => {
        // Print emails
        console.log(emails);
        // ... do something else with emails ...
        emails.forEach(email => {
          add_emails(email);
        });
        // ... do something else with emails ...
      });
  }
}

function load_email(id) {
  document.querySelector('#view-email').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  fetch("/emails/" + id)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);
      // ... do something else with email ...
      set_read(id, true);// When the email is loaded set read to true

      if (email.archived) {
        txt = 'Unarchived';
        cls = 'btn-danger';
      } else {
        txt = 'Archived';
        cls = 'btn-info';
      }

      conntent = `
      <div class="email-btns">
        <button id="read_status" onclick="btn_read(${id})" class="mb-1 col-auto btn btn-danger">Mark as Unread</button>
        <button id="archive_status" onclick="btn_archive(${id});" class="mb-1 col-auto btn ${cls}">Mark as ${txt}</button>
        <button id="read_status" onclick="compose_reply(${id})" class="mb-1 col-auto btn btn-primary">Reply</button>
      </div>
      <div class="row email-sender">
        <h5>From: ${email.sender}</h5>
      </div>
      <div class="row email-recipients">
        <h5 >To: ${email.recipients}</h5>
      </div>
      <div class="row email-subject">
        <h5>Subject: ${email.subject}</h5>
      </div>
      <div class="row email-body">
      <textarea class="form-control" style="resize:none;" disabled>${email.body}</textarea>
      </div>
      `;
      document.querySelector('#view-email').innerHTML = conntent;
    });

}

function add_emails(email) {
  console.log(email);

  const mail = document.createElement('div');

  //If the email is it should have a diffrent stlye
  if (email.read) {
    cls = 'row email-tile read';
  } else {
    cls = 'row email-tile';
  }

  mail.className = 'mb-2 email';
  mail.innerHTML = `
  <a class="email-redir" href="javascript:load_email('${email.id}')">
  <div class="${cls}">
    <h7 class="col-3">From: ${email.sender}</h7>
    <h7 class="col-7">Subject: ${email.subject}</h7>
    <h7 class="col-2">${email.timestamp}</h7>
  </div>
  </a>
   `;

  document.querySelector('#emails-view').append(mail);
}

function send() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
    });
}

function set_archive(id, status) {
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      archived: status
    })
  })
}

function set_read(id, status) {
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      read: status
    })
  })
}

function btn_read(id) {
  document.querySelector('#read_status').classList.toggle('btn-danger');
  document.querySelector('#read_status').classList.toggle('btn-info');
  if (document.querySelector('#read_status').classList.contains('btn-danger')) {
    document.querySelector('#read_status').innerHTML = 'Mark as Unread';
    read = true;
  } else {
    document.querySelector('#read_status').innerHTML = 'Mark as Read';
    read = false;
  }
  set_read(id, read);
}

function btn_archive(id) {
  document.querySelector('#archive_status').classList.toggle('btn-danger');
  document.querySelector('#archive_status').classList.toggle('btn-info');
  if (document.querySelector('#archive_status').classList.contains('btn-info')) {
    document.querySelector('#archive_status').innerHTML = 'Mark as Archived';
    archive = false;
  } else {
    document.querySelector('#archive_status').innerHTML = 'Mark as Unarchived';
    archive = true;
  }
  set_archive(id, archive);
  location.reload();
}