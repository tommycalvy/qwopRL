const ipc = require('electron').ipcRenderer
ipc.send('child-ready', 'ping')
console.log("Child Is Ready")
//document.elementFromPoint(80, 50).click()
//const flashgame = document.getElementById('flashgame')
//flashgame.elementFromPoint(x, y).click()
const x = document.getElementById("flashgame")
x.addEventListener("click", function() {
  console.log("Click happened in child window")
})
function click(x, y)
{
    var ev = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'screenX': x,
        'screenY': y
    })

    var el = document.elementFromPoint(x, y)

    el.dispatchEvent(ev)
}
click(80, 50)
var actions = [
  {
    down: false,
    key: "q"
  },
  {
    down: false,
    key: "w"
  },
  {
    down: false,
    key: "o"
  },
  {
    down: false,
    key: "p"
  },
  {
    down: false,
    key: " "
  },
]

var eventUp = new KeyboardEvent("keyup", {key : "a", })
var eventDown = new KeyboardEvent("keydown", {key : "a", })
ipc.on('action', (event, arg) => {
  var i
  for (i = 0; i < 5; i++) {
    if (arg[i] == 1 && !actions[i].down) {
      actions[i].down = true
      delete eventDown.key;
      Object.defineProperty(eventDown, "key", {"value" : actions[i].key})
      document.dispatchEvent(eventDown);
    } else if (arg[i] == 0 && actions[i].down) {
      actions[i].down = false
      delete eventUp.key;
      Object.defineProperty(eventUp, "key", {"value" : actions[i].key})
      document.dispatchEvent(eventUp);
    }
  }
})
