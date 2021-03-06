const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name')
const usersList = document.getElementById('users')

const joinRoomBtn = document.querySelector('button.join');
const generateBtn = document.querySelector('button.generate');
const leaveRoomBtn = document.querySelector('a.btn');
const copyBtn = document.querySelector('button.copy-room');

const socket = io();

copyBtn.addEventListener('click', (e) => {
  e.preventDefault()
  roomName.select()
  document.execCommand('copy')
  alert(`Copied Room Name ${roomName.value}`)
})

generateBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const randomRoomName = Math.random().toString(16).slice(2);
  document.getElementById('room').value = randomRoomName;
})

joinRoomBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const chat = document.querySelector('.chat-container')
  const joinForm = document.querySelector('.join-container')
  const usernameInput = document.getElementById('username')
  const roomInput = document.getElementById('room')
  const usernameValue = usernameInput.value
  const roomValue = roomInput.value

  if(usernameValue === '' || usernameValue == null) {
    alert('Please enter a nickname!')
    usernameInput.focus()
    return false
  } else if(usernameValue.length < 2) {
    alert('Nickname must be at least 2 characters!')
    usernameInput.focus()
    return false
  }

  if(roomValue === '' || roomValue === null) {
    alert(`Please enter a room or click "Generate Room" button!`)
    roomInput.focus()
    return false
  } else if(roomValue.length < 3) {
    alert('Room name must be at least 3 characters!')
    roomInput.focus()
    return false
  }

  sessionStorage.setItem('username', usernameValue)
  sessionStorage.setItem('room', roomValue)
  chat.classList.remove('blr')
  joinForm.classList.add('dissolve')

// get username and room from URL
// const urlParams = new URLSearchParams(location.search) // TODO: cut off, add session storage
// const [username, room] = [...urlParams.values()]

  // get username and room from session storage
  const {username, room} = sessionStorage

  // join chatroom
  socket.emit('joinRoom', {username, room}) 

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
  // roomName.innerText = room 
  roomName.value = room 

}

// add users list to DOM
function outputUsers(users) {
  usersList.innerHTML = `
  ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
}
