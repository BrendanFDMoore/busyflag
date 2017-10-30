const five = require("johnny-five");

console.log('Shooty Laser v0.1');

let lastHit = new Date();
let SOLENOID_ACTIVE = false;
let score = 0;
let targetTimeout;

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

  const toggleSolenoidControl = () => {
    SOLENOID_ACTIVE = !SOLENOID_ACTIVE;
  };

  const setSolenoidControl = () => {
    console.log('setSolenoidControl', SOLENOID_ACTIVE);
    
    !!SOLENOID_ACTIVE ? solenoidControl.write(1) : solenoidControl.write(0);
    !!SOLENOID_ACTIVE ? this.pinMode(16, five.Pin.OUTPUT) : this.pinMode(16, five.Pin.INPUT);
    !!SOLENOID_ACTIVE ? relay.close() : relay.open();
  };

  const addToScore = add => {
    score = score + add;
  };

  const showScore = () => {
    console.log('Current Score:', score);
  };

  const targetHit = () => {
    console.log('Target hit!');
    if (SOLENOID_ACTIVE) {
      clearTimeout(targetTimeout);
      toggleSolenoidControl();
      setSolenoidControl();
      console.log('Nice shot!');
      addToScore(10);
      showScore();
    }
  };

  const clearTarget = () => {
    if (SOLENOID_ACTIVE) {
      toggleSolenoidControl();
      setSolenoidControl();
      console.log('Too slow!');
      addToScore(-5);
      showScore();
    }
  };

  const randomizeTarget = () => {
    
    if (!SOLENOID_ACTIVE) {
      let r = Math.random();
      console.log('randomizeTarget...', r);
    
      if (r > 0.85) {
        toggleSolenoidControl();
        setSolenoidControl();
        console.log('Target active for 5 seconds!');
        targetTimeout = setTimeout(clearTarget, 5200);
      }
    }
  };

  targetSensor.on("high", function() {
    console.log('targetSensor high!');    
    targetHit();
  });
  targetSensor.on("low", function() {
    console.log('targetSensor low!');        
    targetHit();
  });

  setSolenoidControl();

  setInterval(randomizeTarget, 400);
});