const Gpio = require('pigpio').Gpio;

const vibrGpio = 21;
const samplePeriod = 5000;

class Vibration {
    constructor() {
        this.vibr = new Gpio(vibrGpio, {
            mode: Gpio.INPUT,
            edge: Gpio.RISING_EDGE,
            alert: true
        });

        this.currentVibrations = 0;

        this.lastAvg = 0;

        this.vibr.on('alert', this.handleAlert.bind(this));

        setInterval(this.handleAvg.bind(this), samplePeriod);
    }

    handleAlert(level) {
        if (level === 1) {
            this.currentVibrations++;
        }
    }

    handleAvg() {
        this.lastAvg = (this.currentVibrations / (samplePeriod / 1000));

        this.currentVibrations = 0;
    }

    getAvg() {
        return this.lastAvg;
    }
}

module.exports = new Vibration();