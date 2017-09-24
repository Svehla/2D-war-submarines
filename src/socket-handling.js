import openSocket from 'socket.io-client';
const socket = openSocket('http://mobile-controller.herokuapp.com')
// const socket = openSocket('http://localhost:1337')
// const socket = openSocket('http://localhost:5000/')

function newDirection(cb) {
  socket.on('newDirection', ({ beta, gamma }) => {
    // cb(null, timestamp)
    console.log('dostal jsem novou pozici')
    cb({ beta, gamma })
  })
  //socket.emit('subscribeToTimer', 1000);
}
export { newDirection }