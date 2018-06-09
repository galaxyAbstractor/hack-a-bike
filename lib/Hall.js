const Gpio = require('pigpio').Gpio;
//const LCD = require('lcdi2c');
const Aws = require('./Aws');
const sma = require('sma');

//const lcd = new LCD( 1, 0x27, 20, 4 );

const hallGpio = 17;
const samplePeriod = 500;

const radius = 0.3556;
const wheelCircumference = 2 * Math.PI * radius;

class Hall {
    constructor() {
        this.hall = new Gpio(hallGpio, {
            mode: Gpio.INPUT,
            edge: Gpio.RISING_EDGE,
            alert: true
        });

        this.totalRotations = 0;
        this.currentRotations = 0;

        this.lastRpm = 0;
        this.lastRpm2 = 0;

        this.window = [];

        this.hall.on('alert', this.handleAlert.bind(this));

        setInterval(this.handleRpmAvg.bind(this), samplePeriod);
    }

    handleAlert(level) {
        if (level === 1) {
            this.totalRotations += 1;
            this.currentRotations += 1;
        }

       /* lcd.clear();
        lcd.println("Tot. rots: " + this.totalRotations, 1);

        lcd.println( 'Rpm:' + this.getRpm() + ' Sp:' + this.getSpeed(), 2 );*/
    }

    handleRpmAvg() {

        if (this.window.length > 9) {
            this.window.shift();
        }

        this.window.push(this.currentRotations);

        this.lastRpm = parseFloat(sma(this.window, 10)[0] || 0) * (1000/samplePeriod) * 60;

        this.lastRpm2 = (this.currentRotations) * (1000/samplePeriod) * 60;

        this.currentRotations = 0;
    }

    getRpm() {
        return this.lastRpm;
    }

    getSpeed() {
        return (this.lastRpm * wheelCircumference * 60) / 1000;
    }

    getRpm2() {
        return this.lastRpm2;
    }

    getSpeed2() {
        return (this.lastRpm2 * wheelCircumference * 60) / 1000;
    }

    getRotations() {
        return this.totalRotations;
    }

    resetTotalRotations()  {
        this.totalRotations = 0;
    }

}

module.exports = new Hall();