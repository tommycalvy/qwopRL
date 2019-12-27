module.exports = class ActorCritic {

  constructor(frames, pixWidth, pixHeight){
    this.frames = frames
    this.width = pixWidth
    this.height = pixHeight
    this.actor_lr = actor_lr
    this.critic_lrr = critic_lr

    this.actor = this.build_actor();
    this.critic = this.build_critic();
  }

  build_actor() {
    const model = tf.sequential();

    model.add(tf.layers.conv2d({
      inputShape: [this.width, this.height, this.frames],
      kernelSize: 7,
      filters: 16,
      strides: 3,
      padding: 'valid',
      activation: 'selu',
      kernelInitializer: 'heNormal'
    }));

    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

    model.add(tf.layers.conv2d({
      kernelSize: 5,
      filters: 16,
      strides: 2,
      padding: 'valid',
      activation: 'selu',
      kernelInitializer: 'heNormal'
    }));

    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

    model.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 16,
      strides: 1,
      padding: 'valid',
      activation: 'selu',
      kernelInitializer: 'heNormal'
    }));

    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

    model.add(tf.layers.conv2d({
      kernelSize: 3,
      filters: 16,
      strides: 1,
      padding: 'valid',
      activation: 'selu',
      kernelInitializer: 'heNormal'
    }));

    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

    model.add(tf.layers.flatten());

    model.add(  tf.layers.dense({
      units: NUM_OUTPUT_CLASSES,
      kernelInitializer: 'varianceScaling',
      activation: 'softmax'
    }));

    model.summary();

    model.compile({
      optimizer: tf.train.adam(this.actor_learningr),
      loss:tf.losses.softmaxCrossEntropy
    });

    return model;
  }
}
