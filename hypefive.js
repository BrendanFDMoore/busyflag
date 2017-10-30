const five = require("johnny-five");
// const sleep = require('sleep');

console.log('HypeFive v0.2');

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

  proximity.on("data", function() {
    console.log("Proximity: ");
    console.log("  cm  : ", this.cm);
    console.log("  in  : ", this.in);
    console.log("-----------------");
  });

  proximity.on("change", function() {
    console.log("The obstruction has moved.");
  });

  // const trigger = new five.Button({
  //   pin: 8,
  //   // type: "digital",
  //   // mode: 0,
  //   // isPullup: true,
  // });

  const leftMeHanging = () => {
    console.log('leftMeHanging!');
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
    moveArmUp();
    hangTimeout = setTimeout(leftMeHanging, 3000);
  };

  const highFive = () => {
    console.log('highFive!');
    cancelTimeout(hangTimeout);
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