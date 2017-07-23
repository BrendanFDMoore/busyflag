require('dotenv').config()
const request = require('request');

console.log('BusyFlag v1.0')

const setSlackStatus = (icon, message) => {
  const slackData = {
    token: process.env.SLACK_TOKEN,
    profile: `{"status_text":"${message}","status_emoji":"${icon}"}`,
  }
  console.log(slackData);
  request.post('https://slack.com/api/users.profile.set', {form: slackData}, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred 
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
    console.log('body:', body); // Print the HTML for the Google homepage. 
  });
};


const setSlackRed = () => setSlackStatus(':trafficlight_red:',"Trying to focus. Emergencies only.");
const setSlackYellow = () => setSlackStatus(':trafficlight_yellow:',"Busy but OK to interrupt for work reasons.");
const setSlackGreen = () => setSlackStatus(':trafficlight_green:',"Come on by!");
const setSlackDefault = () => setSlackStatus(':bread:',"Knead something?");

// setSlackRed();
// setSlackYellow();
// setSlackGreen();
setSlackDefault();

console.log('BusyFlag done.')
