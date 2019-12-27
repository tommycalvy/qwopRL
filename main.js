const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
app.commandLine.appendSwitch('ppapi-flash-path', app.getPath('pepperFlashSystemPlugin'))
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
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


let childwin
function createChildWin () {
  childwin = new BrowserWindow({
    width: 160,
    height: 100,
    webPreferences: {
      offscreen: true,
      nodeIntegration: true,
      plugins: true
    },
    show: false
  })
  console.log("Child Created")
  childwin.loadFile('child.html')
  //childwin.setIgnoreMouseEvents(true)
  //childwin.webContents.openDevTools()
  childwin.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    childwin = null
  })
  childwin.once('ready-to-show', () => {
    //childwin.show()
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
  createChildWin()
})

var actionSet = [
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
  },
  {
    down: false,
    key: "Space"
  }
]

function sendAction(action, actionSet, childWindow) {
  var i
  for (i = 0; i < 5; i++) {
    if (action[i] && !actionSet[i].down) {
      actionSet[i].down = true
      childWindow.webContents.sendInputEvent({ type: 'keyDown', keyCode: actionSet[i].key })
      //win.webContents.sendInputEvent({ type: 'char', keyCode })
    } else if (!action[i] && actionSet[i].down) {
      actionSet[i].down = false
      childWindow.webContents.sendInputEvent({ type: 'keyUp', keyCode: actionSet[i].key })
    }
  }
}
let count
let imagebitmap
let stackframes = [][][]
ipcMain.on('child-ready', (event, arg) => {
  console.log("Received child-ready signal: ", arg)
  childwin.focus()
  setTimeout(() => {
      childwin.webContents.sendInputEvent({type:'mouseDown', x: 80, y: 50, button:'left', clickCount: 1})
  }, 1000)
  setTimeout(() => {
      childwin.webContents.sendInputEvent({type:'mouseUp', x: 80, y: 50, button:'left', clickCount: 1})
  }, 1100)
  setTimeout(() => {
    count = 0
    childwin.webContents.on('paint', (event, dirty, image) => {
        imagebitmap = image.crop({x: 60, y: 40, width: 160, height: 160}).resize({height: 80}).toBitmap()
        var j, k
        for (j = 0; j < imagebitmap.length / 4 * 80; j++) {
          for (k = 0; k < 80; k++) {
            stackframes[k][j][count] = imagebitmap[j + k] * 0.2126 / 255.0 + imagebitmap[j + k + 1] * 0.7152 / 255.0 + imagebitmap[j + k + 2] * 0.0722 / 255.0 - 0.5
          }
        }
        win.webContents.send('frame-update', image.toDataURL())
        sendAction([true, false, false, false, false], actionSet, childwin)
        sendAction([true, false, false, true, true], actionSet, childwin)
        count++
    })
  }, 3000)

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
