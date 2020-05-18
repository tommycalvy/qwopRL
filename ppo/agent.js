module.exports = class Agent {
  constructor(ppo, reward, id, stacked_frames) {
    this.actor = ppo.actor();
    this.critic = ppo.critic();
    this.reward = reward.rewardModel();

    this.states    = [];
    this.actions   = [];
    this.values    = [];
    this.logProbs = [];
    this.rewards = [];

    this.stacked_frames = stacked_frames;

    this.step_count = 0;
    this.num_steps = 20;
    this.trajectory_count = 0;

    this.ppo_total_steps = 128;
    this.ppo_epochs = 4;
    this.mini_batch_size = 20;
    this.num_of_actions = 4;
    this.gamma = 0.99;
    this.tau = 0.95;
    this.id = id;
  }

  format_frames(frames) {
    let tframe;
    let state;
    let tframes = [this.stacked_frames];
    for (let i = 0; i < this.stacked_frames; i++) {
      tframe = tf.fromPixels(frames[i], 3).toFloat();
      tframe = tframe.mean(2, true);
      tframes[i] = tframe;
    }
    state = tf.stack(tframes);
    state = tf.image.cropAndResize(state, [0.2, 0.2, 1, 0.7], [0], [81, 81]);
    state = state.batchNorm([0], [1]);
    state = state.squeeze([3]);
    return state;
  }

/*
  insert_frame(frame) {
    this.real_frames.push(frame);
    let tensorframe = tf.fromPixels(frame, 3).toFloat();
    tensorframe = tensorframe.mean(2, true);
    this.frames.push(tensorframe);
    this.frame_step += 1;
  }
*/


  one_hot_action(actionDist) {
    let rand = Math.random();
    let sum = 0;
    let prob = actionDist[0];
    let action = 0;
    for (let i = 0; i < Math.pow(this.num_of_actions, 2); i++) {
      sum += actionDist[i]
      if (sum <= rand) {
        action = i;
        prob = actionDist[i];
        break;
      }
    }
    return [action, prob];
  }

  format_action(num) {
    let bnum = num >>> 0;
    let action = [this.num_of_actions];
    for (let i = 0; i < this.num_of_actions; ++i) {
      if (bnum & (1 << i)) {
        action[i] = true;
      } else {
        action[i] = false;
      }
    }
    return action;
  }

  step(frames) {
      let state = format_frames(frames);
      let actionDist = this.actor.predict(state).dataSync();
      let action = one_hot_action(actionDist);
      let value = this.critic.predict(state).dataSync();
      let logProb = Math.log(action[1]);
      let reward = this.reward.predict(state).dataSync();

      this.step_count += 1;

      if (this.step_count % this.num_steps) {
        let returns = ppo.compute_gae(value, this.values, this.rewards);
        // TODO: upload trajectory to indexDB
        let advantages = [];
        for (let i = 0; i < this.num_steps; i++) {
          advantages.push(returns[i] - this.values[i]);
        }
        ppo.ppo_update();

        this.states = [];
        this.actions = [];
        this.values = [];
        this.logProbs = [];
        this.rewards = [];
        this.step_count = 0;
      }
      this.states.push(state.dataSync());
      this.actions.push(action[0]);
      this.values.push(value);
      this.logProbs.push(logProb);
      this.rewards.push(reward);
  }


}
