const ipc = require('electron').ipcRenderer
const vid = document.getElementById('show')
ipc.on('frame-update', (event, frame) => {
  console.log("Recieved frame-update signal")
  vid.src = frame
})
