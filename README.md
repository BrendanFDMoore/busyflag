# BusyFlag

This is a small utlity to set your slack status to Red Light /Yellow Light/Green Light/Some Default. The idea is based on a traffic signal.

Green Light: I'm ok to chat about whatever right now. Not very focused.
Yellow Light: I'm working on something, but if you need to ask a work related question it's OK to interrupt.
Red Light: I am in the zone. Please do not interrupt unless it is an emergency.
Default: Whatever you like.

This sets both your status emoji and your status message based on what you set up (currently hardcoded to my liking).

## Config

This tool uses `dotenv` and you must create a `.env` file in the project root with a value for `SLACK_TOKEN`:
```
SLACK_TOKEN=some_secret_string
```

## Circuit

This is configured to be triggered by physical button presses on an external circuit, currently implemented on a breadboard with an Arduino and controlled via Johnny-Five.

Diagram:
![BusyFlag Circuit Diagram](https://github.com/brendanfdmoore/busyflag/blob/master/circuit-diagram.png)
