const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
app.commandLine.appendSwitch('ppapi-flash-path', app.getPath('pepperFlashSystemPlugin'))

let agentWindows = []
let policyWindow
let frame_count = []
let step_count = []
let ppo_steps = 100
function createAgentWindows(num, policyId) {
  for (let i = 0; i < num; i++) {
    let agentWindow = new BrowserWindow({
      width: 320,
      height: 200,
      webPreferences: {
        offscreen: true,
        nodeIntegration: true,
        plugins: true,
        additionalArguments: [i.toString(10), policyId.toString(10)]
      },
      //show: true
    })
    agentWindow.loadFile("agentWin.html")
    agentWindows.push(agentWindow)
    frame_count.push(0)
    step_count.push(0)
    console.log("Agent ", i, " Created")
  }
}
function createPolicyWindow() {
  policyWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      //offscreen: true,
      nodeIntegration: true,
      plugins: true
    },
    show: true
  })
  policyWindow.loadFile("policyWin.html")
  return policyWindow.webContents.getProcessId()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  let policyId = createPolicyWindow()
  createAgentWindows(2, policyId)
})

let actionSet = [
  {
    down: false,
    key: "Q"
  },
  {
    down: false,
    key: "W"
  },
  {
    down: false,
    key: "O"
  },
  {
    down: false,
    key: "P"
  }
]

function sendAction(agentWin, action) {
  var i
  for (i = 0; i < 4; i++) {
    if (action[i] && !actionSet[i].down) {
      actionSet[i].down = true
      agentWin.webContents.sendInputEvent({ type: 'keyDown', keyCode: actionSet[i].key })
    } else if (!action[i] && actionSet[i].down) {
      actionSet[i].down = false
      agentWin.webContents.sendInputEvent({ type: 'keyUp', keyCode: actionSet[i].key })
    }
  }
}

ipcMain.on('agent-ready', (event, arg) => {
  let idn = arg[0]
  let ids = arg[1]
  console.log("Agent ", ids, " Is Ready")
  setTimeout(() => {
      agentWindows[idn].webContents.sendInputEvent({type:'mouseDown', x: 80, y: 50, button:'left', clickCount: 1})
  }, 250)
  setTimeout(() => {
      agentWindows[idn].webContents.sendInputEvent({type:'mouseUp', x: 80, y: 50, button:'left', clickCount: 1})
      agentWindows[idn].webContents.on('paint', (event, dirty, image) => {
        agentWindows[idn].webContents.send('frame-id-' + ids, image);
        frame_count[idn] += 1;
        if (frame_count[idn] % 4 == 0) {
          agentWindows[arg[0]].webContents.stopPainting();
          step_count[idn] += 1;
        }
      })
  }, 300)
})

ipcMain.on('action', (event, arg) => {
  sendAction(agentWindows[arg[0]], arg[1]);
  if (step_count[arg[0]] == ppo_steps) {
    step_count[arg[0]] = 0;
  } else {
    agentWindows[arg[0]].webContents.startPainting();
  }
})

ipcMain.on('start-painting', (event, arg) => {
  agentWindows[arg[0]].webContents.startPainting();
})
  /*
  setTimeout(() => {
    count = 0
    childwin.webContents.on('paint', (event, dirty, image) => {
        imagebitmap = image.crop({x: 58, y: 38, width: 162, height: 162}).resize({height: 81}).toBitmap()
        //var j, k
        //for (j = 0; j < imagebitmap.length / 4 * 81; j++) {
          //for (k = 0; k < 81; k++) {
            //stackframes[k][j][count] = imagebitmap[j + k] * 0.2126 / 255.0 + imagebitmap[j + k + 1] * 0.7152 / 255.0 + imagebitmap[j + k + 2] * 0.0722 / 255.0 - 0.5
          //}
        //}
        win.webContents.send('frame-update', image.toDataURL())
        sendAction([true, false, false, false, false], actionSet, childwin)
        sendAction([true, false, false, true, true], actionSet, childwin)
        count++
    })
  }, 3000)
*/
})


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
/*
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      plugins: true
    },
    show: false
  })
  console.log("Parent Created")
  // and load the index.html of the app.
  win.loadFile('index.html')
  //win.webContents.openDevTools()
  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
  win.once('ready-to-show', () => {
    win.show()
  })
}
*/
