module.exports = class PPO {
  // https://naifmehanna.com/2019-02-01-implementing-a2c-algorithm-using-tensorflow-js/
  constructor(frames, pixWidth, pixHeight, actor_lr, critic_lr){
    this.frames = frames;
    this.width = pixWidth;
    this.height = pixHeight;
    this.actor_lr = actor_lr;
    this.critic_lrr = critic_lr;
    this.gamma = 0.99;
    this.tau = 0.95;
    this.batch_size = 20;
    this.mini_batch_size = 5;
    this.ppo_epochs = 4;
    this.num_of_actions = 4;
    this.clip_param = 0.2;
    this.actor = this.build_actor();
    this.critic = this.build_critic();
  }

  build_actor() {
    const model = tf.sequential();
    // Input is 81x81x4
    // 144 weights
    model.add(tf.layers.conv2d({
      inputShape: [this.frames, this.width, this.height],
      kernelSize: 3,
      filters: 16,
      strides: 2,
      padding: 'same',
      dataFormat: 'channelsFirst',
      activation: 'selu',
      kernelInitializer: 'heNormal'
    }));
    // Output is 41x41x8
    // 144 weights
    model.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 16,
      strides: 2,
      padding: 'same',
      activation: 'selu',
      kernelInitializer: 'heNormal'
    }));
    // Output is 21x21x8
    // 144 weights
    model.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 16,
      strides: 2,
      padding: 'same',
      activation: 'selu',
      kernelInitializer: 'heNormal'
    }));
    // Output is 11x11x16
    // 144 weights
    model.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 32,
      strides: 2,
      padding: 'same',
      activation: 'selu',
      kernelInitializer: 'heNormal'
    }));
    // Output is 6x6x32
    // 288 weights
    model.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 32,
      strides: 3,
      padding: 'valid',
      activation: 'selu',
      kernelInitializer: 'heNormal'
    }));
    // Output is 2x2x32
    // 288 weights
    model.add(tf.layers.flatten());
    // Output is 128
    model.add(tf.layers.dense({
      units: 64,
      kernelInitializer: 'heNormal',
      activation: 'selu'
    }));
    // Output is 64
    // 8192 weights
    model.add(tf.layers.dense({
      units: Math.pow(this.num_of_actions, 2),
      kernelInitializer: 'heNormal',
      activation: 'softmax'
    }));
    // 1024 weights
    model.summary();

    model.compile({
      optimizer: tf.train.adam(this.actor_lr),
      loss:tf.losses.softmaxCrossEntropy
    });

    return model;
  }

  build_critic() {
    const model = tf.sequential();
    // Input is 81x81x4
    // 144 weights
    model.add(tf.layers.conv2d({
      inputShape: [this.frames, this.width, this.height],
      kernelSize: 3,
      filters: 16,
      strides: 2,
      padding: 'same',
      dataFormat: 'channelsFirst',
      activation: 'selu',
      kernelInitializer: 'heNormal'
    }));
    // Output is 41x41x8
    // 144 weights
    model.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 16,
      strides: 2,
      padding: 'same',
      activation: 'selu',
      kernelInitializer: 'heNormal'
    }));
    // Output is 21x21x8
    // 144 weights
    model.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 16,
      strides: 2,
      padding: 'same',
      activation: 'selu',
      kernelInitializer: 'heNormal'
    }));
    // Output is 11x11x16
    // 144 weights
    model.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 32,
      strides: 2,
      padding: 'same',
      activation: 'selu',
      kernelInitializer: 'heNormal'
    }));
    // Output is 6x6x32
    // 288 weights
    model.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 32,
      strides: 3,
      padding: 'valid',
      activation: 'selu',
      kernelInitializer: 'heNormal'
    }));
    // Output is 2x2x32
    // 288 weights
    model.add(tf.layers.flatten());
    // Output is 128
    model.add(tf.layers.dense({
      units: 64,
      kernelInitializer: 'heNormal',
      activation: 'selu'
    }));
    // Output is 64
    // 8192 weights
    model.add(tf.layers.dense({
      units: 1,
      kernelInitializer: 'heNormal',
      activation: 'tanh'
    }));
    // 1024 weights
    model.summary();

    model.compile({
      optimizer: tf.train.adam(this.critic_lr),
      loss: tf.losses.softmaxCrossEntropy
    });

    return model;
  }
  get actor() {
    return this.actor;
  }

  get critic() {
    return this.critic;
  }

  compute_gae(next_value, values, rewards) {
    let delta, gae;
    let gae = 0;
    let returns = [];
    values.push(next_value);
    for (let i = this.num_steps - 1; i >= 0; i--) {
      delta = rewards[i] + this.gamma * values[i + 1] - values[i];
      gae = delta + this.gamma * this.tau * gae;
      returns.unshift(gae + values[i]);
    }
    return returns;
  }

  ppo_update(states, actions, old_log_probs, returns, advantages) {
    let x, dist, value, new_log_probs, ratio, surr1, surr2;
    let actor_loss, critic_loss, loss, optimizer;
    let entropy = 0;
    for (let i = 0; i < this.ppo_epochs; i++) {
      for (let j = 0; j < this.mini_batch_size; j++) {
        x = Math.floor(Math.Random() * this.batch_size);
        dist = this.actor.predict(states[x]).dataSync();
        value = this.critic.predict(state[x]).dataSync();
        // TODO: Calculate entropy for the discrete action distribution
        for (let k = 0; k < Math.pos(this.num_of_actions, 2); k++) {
          entropy -= dist[k] * Math.log(dist[k])
        }
        new_log_probs = Math.log(dist[actions[x]]);
        ratio = Math.exp(new_log_probs - old_log_probs[x]);
        surr1 = ratio * advantages[x];
        surr2 = Math.min(Math.max(ratio, 1.0 - this.clip_param), 1.0 + this.clip_param) * advantages[x];

        actor_loss = - Math.min(surr1, surr2);
        critic_loss = Math.pow((returns[x] - value), 2)
        loss = 0.5 * critic_loss + actor_loss - 0.001 * entropy;
        optimizer = this.actor.optimizer();
      }
    }
  }

}
