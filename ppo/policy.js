module.exports = class ActorCritic {
  // https://naifmehanna.com/2019-02-01-implementing-a2c-algorithm-using-tensorflow-js/
  constructor(frames, pixWidth, pixHeight, actor_lr, critic_lr){
    this.frames = frames;
    this.width = pixWidth;
    this.height = pixHeight;
    this.actor_lr = actor_lr;
    this.critic_lrr = critic_lr;

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
      units: 16,
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
      loss:tf.losses.softmaxCrossEntropy
    });

    return model;
  }
  get actor() {
    return this.actor
  }

  get critic() {
    return this.critic
  }

  compute_gae(values, rewards) {
    let gae = 0
    let returns = []
    for (let i = this.ppo_steps - 1; i > 0; i--) {
      let delta = rewards[i] + this.gamma * values[i] - values[i - 1]
      let gae = delta + this.gamma * this.tau * gae
      returns.unshift(gae + values[i])
    }
    return returns
  }

  ppo_update() {
    for (let i = 0; i < this.ppo_epochs; i++) {

    }
  }

}
