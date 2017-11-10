const five = require("johnny-five");
const io = require('socket.io-client');

console.log('Shooty Lasers v1.0');
const socketconfig = require('./socket/config');
const socket = io(socketconfig.ADDRESS);

const sendEventOverSocket = (event) => {
  socket.emit('shooty event', event);   
};

let lastHit = new Date();
let SOLENOID_ACTIVE = false;
let score = 0;
let targetTimeout;

const LOOP_DELAY = 4300;
const RANDOM_TARGET_DELAY_BASE = 1900;
const TARGET_MISS_TIMEOUT = 1600;
let targetActive = false;
let currentTargetColour = null;
let redTargetChances = 0;
let greenTargetChances = 0;
let loopInterval = null;
let missTimeout = null;

five.Board().on("ready", function() {
  const relay = new five.Relay({pin: 15, type: "NC"});
  const solenoidControl = new five.Pin({
    pin: 3,
    type: "digital",
    mode: 1,
  });
  const targetSensor = new five.Pin({
    pin: 10,
    type: "digital",
    mode: 0,
  });
  const startButton = new five.Button({
    pin: 6,
    isPullup: true
  });
  const stopButton = new five.Button({
    pin: 7,
    isPullup: true
  });

  startButton.on("down", function(value) {
    startGame();
  });

  stopButton.on("down", function(value) {
    stopGame();
  });

  const startGame = () => {
    console.log('startGame');
    sendEventOverSocket('startGame');
    redTargetChances = 0;
    greenTargetChances = 0;
    loopInterval = setInterval(gameLoop, LOOP_DELAY);
  };

  const stopGame = () => {
    console.log('stopGame');
    
    sendEventOverSocket('stopGame');    
    clearInterval(loopInterval);
  };

  const raiseTarget = () => {
    targetActive = true;

    relay.close();
  };

  const lowerTarget = () => {
    targetActive = false;
    currentTargetColour = null;    

    relay.open();
  };

  const activateTarget = (isRed) => {
    currentTargetColour = isRed ? 'red' : 'green';
    if (isRed) {
      redTargetChances ++;
    } else {
      greenTargetChances ++;
    }
    sendEventOverSocket(`${currentTargetColour}Target`);
    raiseTarget();
    missTimeout = setTimeout(targetMissDetected, TARGET_MISS_TIMEOUT);
  };

  const targetHitDetected = () => {
    if (!targetActive) return;
    clearTimeout(missTimeout);
    sendEventOverSocket(`${currentTargetColour}Hit`)
    lowerTarget();
  };

  const targetMissDetected = () => {
    if (!targetActive) return;
    clearTimeout(missTimeout);
    sendEventOverSocket(`${currentTargetColour}Miss`)
    lowerTarget();
  };

  targetSensor.on("high", function() {
    console.log('targetSensor high!');    
    targetHitDetected();
  });
  
  targetSensor.on("low", function() {
    console.log('targetSensor low!');        
  });

  const gameLoop = () => {
    console.log('Game Loop');
    console.log('Red Chances:', redTargetChances);
    console.log('Green Chances:', greenTargetChances);
    const randomDelay = Math.round(Math.random()*RANDOM_TARGET_DELAY_BASE);
    const redProbability = (redTargetChances+greenTargetChances) === 0 ? 0.50
      : greenTargetChances / (redTargetChances+greenTargetChances);
    console.log('redProbability:', redProbability);
    
    const nextTargetRed = Math.random() <= redProbability;
    console.log('nextTargetRed:', nextTargetRed);
    setTimeout(() => activateTarget(nextTargetRed), randomDelay);
  };
});