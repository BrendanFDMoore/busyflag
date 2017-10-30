require('dotenv').config()
const request = require('request');
const five = require("johnny-five");

console.log('BusyFlag v1.1')

const setSlackStatus = (icon, message) => {
  const slackData = {
    token: process.env.SLACK_TOKEN,
    profile: `{"status_text":"${message}","status_emoji":"${icon}"}`,
  }
  console.log('Setting status...')
  process.env.DEBUG && console.log(slackData);
  request.post('https://slack.com/api/users.profile.set', {form: slackData}, function (error, response, body) {
    if (process.env.DEBUG) {
      console.log('error:', error); // Print the error if one occurred 
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
      console.log('body:', body); // Print the HTML for the Google homepage. 
    } else {
      if (body) {
        console.log('...Status set OK: ', body.ok);
      }
    }
  });
};

const setSlackRed = () => setSlackStatus(':trafficlight_red:',"Trying to focus. Emergencies only.");
const setSlackYellow = () => setSlackStatus(':trafficlight_yellow:',"Busy but OK to interrupt for work reasons.");
const setSlackGreen = () => setSlackStatus(':trafficlight_green:',"Come on by!");
const setSlackDefault = () => setSlackStatus(':bread:',"Knead something?");

five.Board().on("ready", function() {

  const offButton = new five.Button({
    pin: 6,
    isPullup: true
  });
  const greenButton = new five.Button({
    pin: 7,
    isPullup: true
  });
  const yellowButton = new five.Button({
    pin: 8,
    isPullup: true
  });
  const redButton = new five.Button({
    pin: 9,
    isPullup: true
  });

  const redLed = new five.Led(5);
  const yellowLed = new five.Led(4);
  const greenLed = new five.Led(3);

  const allOff = () => {
    redLed.off();
    yellowLed.off();
    greenLed.off();
  };

  offButton.on("down", function(value) {
    allOff();
    setSlackDefault();
  });

  greenButton.on("down", function(value) {
    allOff();
    greenLed.on();
    setSlackGreen();    
  });

  yellowButton.on("down", function(value) {
    allOff();
    yellowLed.on();
    setSlackYellow();    
  });

  redButton.on("down", function(value) {
    allOff();
    redLed.on();
    setSlackRed();
  });
});
