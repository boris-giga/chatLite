const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name')
const usersList = document.getElementById('users')

const joinRoomBtn = document.querySelector('button.btn');
const leaveRoomBtn = document.querySelector('a.btn');

const socket = io();

joinRoomBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const chat = document.querySelector('.chat-container')
  const joinForm = document.querySelector('.join-container')
  const usernameValue = document.getElementById('username').value
  const roomValue = document.getElementById('room').value
  sessionStorage.setItem('username', usernameValue)
  sessionStorage.setItem('room', roomValue)
  chat.classList.remove('blr')
  joinForm.classList.add('dissolve')
  console.log(`${usernameValue} / ${roomValue} // ${sessionStorage}`)

// get username and room from URL
// const urlParams = new URLSearchParams(location.search) // TODO: cut off, add session storage
// const [username, room] = [...urlParams.values()]

  // get username and room from session storage
  const {username, room} = sessionStorage

  

  // join chatroom
  socket.emit('joinRoom', {username, room}) // TODO get from session storage

  // get room and users
  socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room),
    outputUsers(users)
  })

  // message from server
  socket.on('message', (message) => {
    console.log(message);
    outputMessage(message);

    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  // message submit
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get message text
    const msg = e.target.elements.msg.value;
    
    // emit message to server
    socket.emit('chatMessage', msg);

    // clear input and focus
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
  });
})

function clearChatMessages() {
  const chat = document.querySelector('.chat-messages')
  chat.innerText = ''
}

leaveRoomBtn.addEventListener('click', (e) => {
  clearChatMessages()
  sessionStorage.clear()
  const chat = document.querySelector('.chat-container')
  const joinForm = document.querySelector('.join-container')
  joinForm.classList.remove('dissolve')
  chat.classList.add('blr')
  window.location.reload()
})

// output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  const {text, username, time} = message

  // add a classname to created divs
  div.classList.add('message');

  div.innerHTML = `<p class="meta">${username} <span>${time}</span></p>
  <p class="text">
    ${text}
  </p>`;

  document.querySelector('.chat-messages').appendChild(div);
}

// add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room 
}

// add users list to DOM
function outputUsers(users) {
  usersList.innerHTML = `
  ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
}


// removes blur from chat
// function clickJoin() {
//   const chat = document.querySelector('.chat-container')
//   const joinForm = document.querySelector('.join-container')
//   const usernameValue = document.getElementById('username').value
//   const roomValue = document.getElementById('room').value
//   sessionStorage.setItem('username', usernameValue)
//   sessionStorage.setItem('room', roomValue)
//   chat.classList.remove('blr')
//   joinForm.classList.add('dissolve')
//   console.log(`${usernameValue} / ${roomValue} // ${sessionStorage}`)
// }

function clickLeave() {
  sessionStorage.clear()
  const chat = document.querySelector('.chat-container')
  const joinForm = document.querySelector('.join-container')
  joinForm.classList.remove('dissolve')
  chat.classList.add('blr')
}
