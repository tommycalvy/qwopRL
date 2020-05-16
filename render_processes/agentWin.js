const remote = require('electron').remote;
let win = remote.getCurrentWindow();

let params = remote.getGlobal('params');
let ppo_steps = params.ppo_steps;
let framesStacked = params.frames;
let input_width = params.input_width;
let input_height = params.input_height;
let actor_lr = params.actor_lr;
let critic_lr = params.critic_lr;
let reward_lr = params.reward_lr;
let game_choice = params.game_choice;



let arg = window.process.argv.slice(-2);
let policyId = parseInt(arg[1]);
let id = parseInt(arg[0]);


let ppo = new PPO(
  framesStacked,
  input_width,
  input_height,
  actor_lr,
  critic_lr
);
let agent = new Agent(ppo, id, 4);
let reward = new Reward(framesStacked, input_width, input_height, reward_lr);
let game = new FlashGameAdapter(game_choice, win.webContents, agent, framesStacked);





game.start_game();



//ipc.send('agent-ready', id);



/*
ipc.on('frame-id-' + id, (event, frame) => {
  let output = agent.step(frame)
  if (output != NULL) {
    ipc.sendSync('action', [idn, output[0]])
    ipc.sendTo(policyId, 'ppo-data', output)
  }
})
*/

ipcMain.on('agent-ready', (event, arg) => {
  let idn = arg[0]
  let ids = arg[1]
  console.log("Agent ", ids, " Is Ready")

})

ipcMain.on('start-painting', (event, arg) => {
  agentWindows[arg[0]].webContents.startPainting();
})

ipcMain.on('action', (event, arg) => {
  sendAction(agentWindows[arg[0]], arg[1]);
  if (step_count[arg[0]] == ppo_steps) {
    step_count[arg[0]] = 0;
  } else {
    agentWindows[arg[0]].webContents.startPainting();
  }
})


/*

function start() {
  var e = jQuery.Event("keydown", {keyCode: 81, which:81});
  setTimeout(() => {
    $("#flashgame").focus();

    $("body").trigger(e);
  }, 4000)
}


window.onload = start();








//document.elementFromPoint(80, 50).click()
//const flashgame = document.getElementById('flashgame')
//flashgame.elementFromPoint(x, y).click()
//const x = document.getElementById("flashgame")
//x.addEventListener("click", function() {
//console.log("Click happened in child window")
//})
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
function simulateKeyPress(character) {
  jQuery.event.trigger({ type : 'keypress', which : character.charCodeAt(0) });
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
*/
