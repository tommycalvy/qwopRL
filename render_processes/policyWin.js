const ipc = require('electron').ipcRenderer;
const math = require('mathjs')

let reward = new Reward(4, 81, 81, 0.95);
const vid1 = document.getElementById('vid1');
const vid2 = document.getElementById('vid2');
const ctxvid1 = vid1.getContext('2d');
const ctxvid2 = vid2.getContext('2d');
let stopClip = false;
let dist = 0;
let ppo_round = 0;
let ppo_steps = 100;
let clips_created = [];
let frames_in_clips = 25;
let data = new Array(4);
let clip_buffer = [];
let preppedData = [];
for (let i = 0; i < 4; i++) {
  data[i] = [];
  clips_created[i] = 0;
}

function generateClip(agentid, start, end) {
  let frames = (end - start) * data[agentid][0][4].length;
  let clip = [frames];
  for (let j = start; j <= end; j++) {
    for (let k = 0; k < data[agentid][j][4].length; k++) {
      clip.push(data[agentid][j][4][k].toBitmap();
    }
  }
  return clip
}

function formatStates(agentid, start, end) {
  let frames = end - start;
  let states = [frames];
  for (let j = start; j <= end; j++) {
      states.push(data[agentid][j][1]);
  }
  return states
}


function predictRewardsAndVariance(states) {
  let num = states.length;
  let rewards = reward.predict(states, {batchSize: num});
  rewards = rewards.dataSync();
  //let rewardVar = math.variance(rewards);
  let rewardSum = math.exp(math.sum(rewards));
  // also calculate eponentially cumulative rewards (equation in paper)
  return [rewards, rewardSum];
}

function presentClip() {
  if (clip_buffer < 2) {
    console.log("Not enough clips in buffer.");
  } else {
    let mid = math.floor(clip_buffer.length / 2)
    let clip1 = clip_buffer[mid][0];
    let clip2 = clip_buffer[mid - 1][0];
    stopClip = false;
    while (!stopClip) {
      for (let i = 0; i < clip_buffer[mid][0].length; i++) {
        setTimeout(function() {
          ctxvid1.drawImage(clip_buffer[mid][0][i], 0, 0);
          ctxvid2.drawImage(clip_buffer[mid - 1][0][i], 0, 0);
        }, 100);
        if (stopClip) {
          break;
        }
      }
    }
    if (dist == NULL) {

    } else {

    }
  }
}

function recordPreference(clipDist) {
  dist = clipDist;
  stopClip = true;
  presentClip();
}

ipc.on('ppo-data', (event, output) => {
  data[output[5]].push(output)
  for (let i = 0; i < 4; i++) {
    if (data[i].length % frames_in_clips == 0) {
      let states = formatStates(i, clips_created[i] * frames_in_clips, (clips_created[i] + 1) * frames_in_clips);
      let clip = generateClip(i, clips_created[i] * frames_in_clips, (clips_created[i] + 1) * frames_in_clips);
      let results = predictRewardsAndVariance(states);
      let clipData = [clip, states, results[0], results[1]];
      for (let i = 0; i < clip_buffer.length; i++) {
        if (clip_buffer[i][3] > clipData[3]) {
          clip_buffer.splice(i, 0, clipData);
        }
      }
      clips_created[i] += 1;
    }
  }
  if (data[0].length == ppo_steps && data[1].length == ppo_steps && data[2].length == ppo_steps && data[3].length == ppo_steps) {
    //update ppo and reward
  }
})
