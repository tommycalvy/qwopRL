module.exports = class Agent {
  constructor(policy, id, stackedFrames) {
    this.actor = policy.actor()
    this.critic = policy.critic()
    //this.reward = reward
    //this.logProbs = []
    //this.values    = []
    //this.states    = []
    //this.actions   = []
    //this.rewards   = []
    this.stacked_frames = stackedFrames
    this.frames    = [this.stacked_frames]
    this.real_frames = [this.stacked_frames]
    this.frame_step = 0
    this.ppo_total_steps = 128
    this.ppo_steps = 0
    this.ppo_epochs = 4
    this.mini_batch_size =
    this.action_space = 16
    this.gamma = 0.99
    this.tau = 0.95
    this.id = id
  }

  format_frames() {
    let state = tf.stack(this.frames)
    state = tf.image.cropAndResize(state, [0.2, 0.2, 1, 0.7], [0], [81, 81])
    state = state.batchNorm([0], [1])
    state = state.squeeze([3])
    this.frame_step = 0
    return state
  }

  insert_frame(frame) {
    this.real_frames.push(frame)
    let tensorframe = tf.fromPixels(frame, 3).toFloat()
    tensorframe = tensorframe.mean(2, true)
    this.frames.push(tensorframe)
    this.frame_step += 1
  }



  one_hot_action(actionDist) {
    let rand = Math.random();
    let sum = 0;
    let prob = actionDist[0];
    let action = 0;
    for (let i = 0; i < this.action_space; i++) {
      sum += actionDist[i]
      if (sum <= rand) {
        action = i;
        prob = actionDist[i];
      }
    }
    return [action, prob];
  }

  format_action(num) {
    let action = []
    switch (num) {
      case 0:
        action = [false, false, false, false]
        break;
      case 1:
        action = [true, false, false, false]
        break;
      case 2:
        action = [false, true, false, false]
        break;
      case 3:
        action = [true, true, false, false]
        break;
      case 4:
        action = [false, false, true, false]
        break;
      case 5:
        action = [true, false, true, false]
        break;
      case 6:
        action = [false, true, true, false]
        break;
      case 7:
        action = [true, true, true, false]
        break;
      case 8:
        action = [false, false, false, true]
        break;
      case 9:
        action = [true, false, false, true]
        break;
      case 10:
        action = [false, true, false, true]
        break;
      case 11:
        action = [true, true, false, true]
        break;
      case 12:
        action = [false, false, true, true]
        break;
      case 13:
        action = [true, false, true, true]
        break;
      case 14:
        action = [false, true, true, true]
        break;
      case 15:
        action = [true, true, true, true]
        break;
      default:
        action = [false, false, false, false]
    }
    return action
  }



  step(frame) {
    insert_frame(frame)
    if (this.frame_step == this.stacked_frames) {

      let state = format_frames();
      let actionDist = this.actor.predict(state).dataSync();
      let action = one_hot_action(actionDist);
      let logProb = Math.log(action[1]);
      let value = this.critic.predict(state).dataSync();
      //let state = state.dataSync();

      //this.states.push(state)
      //this.logProbs.push(logProb)
      //this.actions.push(action[0])
      //this.values.push(value)

      this.ppo_steps += 1;
      return [format_action(action[0]), state, value, logProb, this.real_frames, this.id];
    } else {
      return NULL;
    }
  }


}
