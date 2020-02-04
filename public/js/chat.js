const socket = io();

const sendMessage = document.querySelector('#sendMessage');
const locationButton = document.querySelector('#send-location');
const $messageFormButton = document.querySelector('#send-button');
const $messageFormInput = document.querySelector('input');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#list-template').innerHTML;

// Query Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
   const $newMessage = $messages.lastElementChild;

   // Get HEight with margins
   const newMessageStyles = getComputedStyle($newMessage);
   const newMessageMargin = parseInt(newMessageStyles.marginBottom);
   const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

   // Visible Height
   const visibleHeight = $messages.offsetHeight;

   // Height of messages container
   const containerHeight = $messages.scrollHeight;

   // Scroll Offset
   const scrollOffset = $messages.scrollTop + visibleHeight;

   if (containerHeight - newMessageHeight <= scrollOffset) {
      $messages.scrollTop = $messages.scrollHeight;
   }
};

socket.on('greeting', (message) => {
   const html = Mustache.render(messageTemplate, {
      username: message.userName,
      message: message.text,
      createdAt: moment(message.createdAt).format('h:mm a')
   });
   $messages.insertAdjacentHTML('beforeend', html);
   autoScroll();
});

socket.on('sendCoordsMsg', (coords) => {
   console.log(coords);
   const html = Mustache.render(locationTemplate, {
      username: coords.userName,
      coords: coords.url,
      createdAt: moment(coords.createdAt).format('h:mm a')
   });
   $messages.insertAdjacentHTML('beforeend', html);
   autoScroll();
});

sendMessage.addEventListener('submit', (e) => {
   e.preventDefault();
   let inputMessage = e.target.elements.inputMessage.value;
   //
   $messageFormButton.setAttribute('disabled', 'disabled');

   socket.emit('sendMessage', inputMessage, (error) => {
      $messageFormButton.removeAttribute('disabled');
      $messageFormInput.value = '';
      $messageFormInput.focus();

      if (error) {
         return console.log(error);
      }
   });
});

locationButton.addEventListener('click', () => {
   if (!navigator.geolocation) {
      return alert('Geolocation is not supported!')
   }
   locationButton.setAttribute('disabled', 'disabled');

   navigator.geolocation.getCurrentPosition((position) => {
      socket.emit('sendCoords', {
         lat: position.coords.latitude,
         long: position.coords.longitude
      }, (msg) => {
         locationButton.removeAttribute('disabled');
         console.log(msg);
      });
   });
});

socket.emit('join', { username, room }, (error) => {
   if (error) {
      alert(error);
      location.href = '/';
   }
});

socket.on('roomData', ({ room, users }) => {
   const html = Mustache.render(sidebarTemplate, {
      room,
      users
   });

   document.querySelector('#sidebar').innerHTML = html;
});
