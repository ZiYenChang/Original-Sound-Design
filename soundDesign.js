// clock
function startTime() {
  var today = new Date();
  var y = today.getFullYear();
  var M = today.getMonth()+1;
  var d = today.getDate();
  var h = today.getHours();
  var m = today.getMinutes();
  m = checkTime(m);
  document.getElementById('time').innerHTML =
  d  + "-" + M + "-" + y + "<br>" + h + ":" + m;
  var t = setTimeout(startTime, 500);
}

function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

//audio context
var context = new AudioContext;
var myNoise;//rain noise1
var rainHigh;//rain noise 2
const clockAudio = new Audio("clock.wav"); //clock ticking
const clock = context.createMediaElementSource(clockAudio);

context.resume();
let gain = new GainNode(context);
let highgain = new GainNode(context);
let bandgain = new GainNode(context);
let clockgain = new GainNode(context);
let master = new GainNode(context);
bandgain.gain.value = 3;


// set up listener and panner position information
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var xPos = Math.floor(WIDTH/2);
var yPos = Math.floor(HEIGHT/2);
var zPos = 5000;

//pan (rain further)
var panner = new PannerNode(context, {
    panningModel: 'HRTF',
    distanceModel: 'linear',
    positionX: xPos,
    positionY: yPos,
    positionZ: zPos,
    orientationX: 0.0,
    orientationY: 0.0,
    orientationZ: -1.0,
    refDistance: 1,
    maxDistance: 10000,
    rolloffFactor: 10,
    coneInnerAngle: 360,
    coneOuterAngle: 360,
    coneGain: 0
})

//listener
var listener = context.listener;
listener.positionX.value = xPos;
listener.positionY.value = yPos;
listener.positionZ.value = 0;
listener.forwardX.value = 0;
listener.forwardY.value = 0;
listener.forwardZ.value = -1;
listener.upX.value = 0;
listener.upY.value = 1;
listener.upZ.value = 0;

//biquad filter - low pass
var lowPassFilter = context.createBiquadFilter();
lowPassFilter.type = 'lowpass';
lowPassFilter.frequency.value = 10000;
lowPassFilter.Q.value = 0.001;

var lowPassFilter2 = context.createBiquadFilter();
lowPassFilter2.type = 'lowpass';
lowPassFilter2.frequency.value = 11000;
lowPassFilter2.Q.value = 0.001;

var lowPassFilter3 = context.createBiquadFilter();
lowPassFilter3.type = 'lowpass';
lowPassFilter3.frequency.value = 13000;
lowPassFilter3.Q.value = 0.001;

var lowPassFilter4 = context.createBiquadFilter();
lowPassFilter4.type = 'lowpass';
lowPassFilter4.frequency.value = 15000;
lowPassFilter4.Q.value = 0.001;

var lowPassFilterClock = context.createBiquadFilter();
lowPassFilterClock.type = 'lowpass';
lowPassFilterClock.frequency.value = 15000;


//biquad filter - low shelf
var lowShelfFilter = context.createBiquadFilter();
lowShelfFilter.type = 'lowshelf';
lowShelfFilter.frequency.value = 400;
lowShelfFilter.gain.value = 10;


//biquadFilter - band pass
var bandPassFilter = context.createBiquadFilter();
bandPassFilter.type = 'bandpass';
bandPassFilter.frequency.value = 5500;

//biquadFilter - band pass
var bandPassFilter2 = context.createBiquadFilter();
bandPassFilter2.type = 'bandpass';
bandPassFilter2.frequency.value = 6000;
bandPassFilter2.Q.value = 3;

//notchFilter
var notchFilter = context.createBiquadFilter();
notchFilter.type = 'notch';
notchFilter.frequency.value = 15000;
notchFilter.Q.value = 20;

var notchFilter2 = context.createBiquadFilter();
notchFilter2.type = 'notch';
notchFilter2.frequency.value = 16000;
notchFilter2.Q.value = 20;

var notchFilter3 = context.createBiquadFilter();
notchFilter3.type = 'notch';
notchFilter3.frequency.value = 17000;
notchFilter3.Q.value = 20;

var notchFilter4 = context.createBiquadFilter();
notchFilter4.type = 'notch';
notchFilter4.frequency.value = 18000;
notchFilter4.Q.value = 20;


//the connections
lowPassFilter.connect(lowPassFilter2);
lowPassFilter2.connect(lowPassFilter3);
lowPassFilter3.connect(lowPassFilter4);
lowPassFilter4.connect(lowShelfFilter);

lowShelfFilter.connect(panner);
bandPassFilter.connect(bandPassFilter2)
bandPassFilter2.connect(bandgain)
bandgain.connect(panner)

panner.connect(notchFilter);
notchFilter.connect(notchFilter2);
notchFilter2.connect(notchFilter3);
notchFilter3.connect(notchFilter4);
notchFilter4.connect(master);
master.connect(context.destination);

//the clock ticking
clockgain.gain.value = 50;
clock.connect(clockgain);
clockgain.connect(lowPassFilterClock);
lowPassFilterClock.connect(master);

//to see all default value
var initialVol = 20*Math.log10(Rain.value).toFixed(3);
RainLabel.innerHTML = initialVol + 'dB';
//set up call backs from interface
Rain.oninput = function() {
  var vol = (20*Math.log10(this.value)).toFixed(3);
  RainLabel.innerHTML = vol + ' dB';
  gain.gain.value = this.value;
  highgain.gain.value = this.value*1.1;
}

//the clock will always ticking, indicates the time will never stop
var interval = setInterval(function() {
   clockAudio.play();
}, 1000);

//start button
start.onclick = function() {
  let now = context.currentTime;
  gain.connect(lowPassFilter);
  highgain.connect(bandPassFilter);
  //Rain gradually
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(Rain.value, context.currentTime + 3);
  highgain.gain.setValueAtTime(0.0001, context.currentTime);
  highgain.gain.exponentialRampToValueAtTime(Rain.value, context.currentTime + 3);
  console.log('Connect to destination'+Rain.value);
}

Stop.onclick = function() {
  //Stop gradually
  gain.gain.setValueAtTime(Rain.value, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 3);
  highgain.gain.setValueAtTime(Rain.value, context.currentTime);
  highgain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 3);
  console.log('stop rain');
}

//AudioWorkletProcessor
context.audioWorklet.addModule('worklets.js').then(() =>{
   myNoise = new AudioWorkletNode(context,'noise-generator');
   rainHigh = new AudioWorkletNode(context,'noise-generator');
   myNoise.connect(gain);
   rainHigh.connect(highgain);
});



// Recording
recorder = new Recorder(master);
StartRec.onclick = function() { recorder.record() }
StopRec.onclick = function() {
  console.log('stop recording')
  recorder.stop();
  recorder.exportWAV(function(blob){
    document.querySelector("audio").src = URL.createObjectURL(blob)
  });
}
