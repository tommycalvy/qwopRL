module.exports = class frameCapturer {
  constructor(agents, stackedFramesNum) {
    this.agents = agents;
    this.num_of_agents = this.agents.length;
    this.load_delay = 250;
    this.focus_click_x = 80;
    this.focus_click_y = 50;
    this.frame_count = [this.num_of_agents];
    this.stacked_frames_num = stackedFramesNum;
  }

  init_frame_capture(id) {
    setTimeout(() => {
        this.agents[id].webContents.sendInputEvent({type:'mouseDown', x: this.focus_click_x, y: this.focus_click_y, button:'left', clickCount: 1})
    }, this.load_delay);

    setTimeout(() => {
        this.agents[id].webContents.sendInputEvent({type:'mouseUp', x: this.focus_click_x, y: this.focus_click_y, button:'left', clickCount: 1});

        this.agents[id].webContents.on('paint', (event, dirty, frame) => {

          this.agents[id].webContents.send('frame-id-' + id, frame);
          this.frame_count[id] += 1;
          if (this.frame_count[id] % this.stacked_frames_num == 0) {
            this.agents[id].webContents.stopPainting();
          }
        })
    }, this.load_delay + 50);
  }


}
