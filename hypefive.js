const five = require("johnny-five");
const _ = require("lodash");

console.log('HypeFive v1.0');

let ARM_UP = false;
let hangTimeout = null;

five.Board().on("ready", function() {

  const servo = new five.Servo({
    pin: 11,
    range: [10, 140],
    startAt: 10,
    pwmRange: [544, 2400]
  });

  const forceSensor = new five.Pin({
    pin: 13,
    type: "digital",
    mode: 0,
  });

  var proximity = new five.Proximity({
    controller: "GP2Y0A41SK0F",
    pin: "A1"
  });

  var piezo = new five.Piezo(3);

  const playReadySound = () => {
    piezo.play({
      song: [
        ["C4", 1],
        [null, 1],
        ["C4", 1],
        [null, 1],
        ["C4", 1],
      ],
      tempo: 120
    });
  };

  const playHappySound = () => {
    piezo.play({
      song: [
        ["G#5", 1],
        ["F#5", 1],
        ["G#5", 1],
        ["A5", 1],
      ],
      tempo: 120
    });
  };

  const playSadSound = () => {
    piezo.play({
      song: [
        ["A3", 1],
        ["G3", 1],
        ["F#3", 1],
        ["F3", 2],
      ],
      tempo: 150
    });
  };

  const leftMeHanging = () => {
    console.log('leftMeHanging!');
    playSadSound();
    moveArmDown();
  };

  const moveArmDown = () => {
    ARM_UP = false;
    servo.to(10);
  };

  const moveArmUp = () => {
    ARM_UP = true;
    servo.to(130);
  };

  const activateArm = () => {
    console.log('activateArm!');
    if (ARM_UP) {
      return;
    }
    playReadySound();
    setTimeout(moveArmUp, 2500);
    hangTimeout = setTimeout(leftMeHanging, 5000);
  };

  const highFive = () => {
    clearTimeout(hangTimeout);
    console.log('highFive!');
    playHappySound();
    moveArmDown();
  };

  forceSensor.on("high", function() {
    console.log('forceSensor high!');
    if (ARM_UP) {
      highFive();
    }
  });

  forceSensor.on("low", function() {
    console.log('forceSensor low!');        
  });

  const proximityDetected = () => {
    console.log('proximityDetected');
    activateArm();
  };

  const debouncedProximityDetected = _.throttle(proximityDetected, 500, { leading: true });
  
  const proximityReading = (cm, inches) => {
    // console.log("Proximity: ");
    // console.log("  cm  : ", cm);
    // console.log("  in  : ", inches);
    // console.log("-----------------");

    if (ARM_UP === false && cm >= 0.0 && cm <= 10.0) {
      debouncedProximityDetected();
    }
  }

  const throttledProximityReading = _.throttle(proximityReading, 500);

  proximity.on("data", function() {
    throttledProximityReading(this.cm, this.in);
  });

  const proximityObstructionMoved = () => {
    // console.log("The obstruction has moved.");
  }
  const throttledProximityObstructionMoved = _.throttle(proximityObstructionMoved, 500);  

  proximity.on("change", function() {
    throttledProximityObstructionMoved();
  });

  this.repl.inject({
    servo: servo
  });
});