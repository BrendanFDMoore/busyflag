const five = require("johnny-five");
const _ = require("lodash");
// const sleep = require('sleep');

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

  const playQueueSound = () => {
    piezo.play({
      // song is composed by an array of pairs of notes and beats
      // The first argument is the note (null means "no note")
      // The second argument is the length of time (beat) of the note (or non-note)
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
      // song is composed by an array of pairs of notes and beats
      // The first argument is the note (null means "no note")
      // The second argument is the length of time (beat) of the note (or non-note)
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
      // song is composed by an array of pairs of notes and beats
      // The first argument is the note (null means "no note")
      // The second argument is the length of time (beat) of the note (or non-note)
      song: [
        ["A3", 1],
        ["G3", 1],
        ["F#3", 1],
        ["F3", 2],
      ],
      tempo: 150
    });
  };

  // playSadSound();  

  const playGiveUp = () => {
    piezo.play({
      // song is composed by an array of pairs of notes and beats
      // The first argument is the note (null means "no note")
      // The second argument is the length of time (beat) of the note (or non-note)
      song: [
        ["C4", 1 / 4],
        ["D4", 1 / 4],
        ["F4", 1 / 4],
        ["D4", 1 / 4],
        ["A4", 1 / 4],
        [null, 1 / 4],
        ["A4", 1],
        ["G4", 1],
        [null, 1 / 2],
        ["C4", 1 / 4],
        ["D4", 1 / 4],
        ["F4", 1 / 4],
        ["D4", 1 / 4],
        ["G4", 1 / 4],
        [null, 1 / 4],
        ["G4", 1],
        ["F4", 1],
        [null, 1 / 2]
      ],
      tempo: 100
    });
  };
  // const trigger = new five.Button({
  //   pin: 8,
  //   // type: "digital",
  //   // mode: 0,
  //   // isPullup: true,
  // });

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
    playQueueSound();
    // moveArmUp();
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
    // console.log("Proximity: ");
    // console.log("  cm  : ", this.cm);
    // console.log("  in  : ", this.in);
    // console.log("-----------------");
    throttledProximityReading(this.cm, this.in);
    // _.throttle(() => proximityReading(this.cm, this.in), 500);
  });

  const proximityObstructionMoved = () => {
    // console.log("The obstruction has moved.");
  }
  const throttledProximityObstructionMoved = _.throttle(proximityObstructionMoved, 500);  

  proximity.on("change", function() {
    throttledProximityObstructionMoved();
  });

  // trigger.on("high", function() {
  //   console.log('trigger activated!');    
  //   activateArm();
  // });

  this.repl.inject({
    servo: servo
  });
  // sleep.sleep(3);
  // console.log('log 1');
  // servo.to(10);
  // console.log('log 2');
  // setTimeout(() => {
  //   servo.to(130);
  // }, 4000);
});