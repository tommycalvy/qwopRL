module.exports = class FlashGameAdapter {

  constructor(game, webContents, agent, framesStacked) {
    this.game = game;
    this.webContents = webContents;
    this.agent = agent;
    this.framesStacked = framesStacked;
    this.actionSet = game_choice();
    this.frameCount = 0;
  }

  qwop() {
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
    ];
    return actionSet
  }

  game_choice() {
    switch(this.game) {
      case "qwop":
        this.actionSet = qwop();
        break;
      default:
        this.actionSet = qwop();
    }
  }

  send_action(action) {
    for (let i = 0; i < 4; i++) {
      if (action[i] && !this.actionSet[i].down) {
        this.actionSet[i].down = true;
        this.webContents.sendInputEvent({ type: 'keyDown', keyCode: this.actionSet[i].key });
      } else if (!action[i] && this.actionSet[i].down) {
        this.actionSet[i].down = false;
        this.webContents.sendInputEvent({ type: 'keyUp', keyCode: this.actionSet[i].key });
      }
    }
  }

  get action_set() {
    return this.ActionSet;
  }

  start_game() {
    let output;
    let frames = [this.framesStacked];
    setTimeout(() => {
        this.webContents.sendInputEvent({type:'mouseDown', x: 80, y: 50, button:'left', clickCount: 1})
    }, 250)
    setTimeout(() => {
        this.webContents.sendInputEvent({type:'mouseUp', x: 80, y: 50, button:'left', clickCount: 1})
        this.webContents.on('paint', (event, dirty, image) => {
          frames[this.frameCount] = image;
          this.frameCount++;
          if (this.frameCount % this.framesStacked == 0) {
            this.webContents.stopPainting(); // Need to check if it actually stops the flash game
            output = this.agent.step(frames);
            send_action(output.action);
            this.webContents.startPainting(); // May need to put this before send_action
            frameCount = 0;
          }
        })
    }, 300)
  }
  
}
