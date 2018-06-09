const Aws = require('./Aws');
const Vibration = require('./Vibration');
const MPU = require('./MPU');
const Hall = require('./Hall');
const sma = require('sma');

const collectionInterval = 1000;
const sendInterval = 1000;

class Collector {
    constructor() {
        this.collectedData = [];

        this.mAvgSpeed = [];
        this.mAvgSpeed2 = [];
        this.mAvgVibration = [];
        this.mAvgMCU = {
            gyro: {
                x: [],
                y: [],
                z: [],
            },
            accel: {
                x: [],
                y: [],
                z: [],
            },
            rotation: {
                x: [],
                y: [],
            }
        };

        setInterval(this.handleCollection.bind(this), collectionInterval);
        setInterval(this.handleSend.bind(this), sendInterval);
    }

    handleCollection() {
        let speed = Hall.getSpeed();
        let speed2 = Hall.getSpeed2();
        let vibration = Vibration.getAvg();
        let mpuData = MPU.getData();

        let data = {
            time: (new Date()).getTime(),
            speed: speed,
            speed2: speed2,
            gyro: {
                x: mpuData.gyro.x,
                y: mpuData.gyro.y,
                z: mpuData.gyro.z
            },
            accel: {
                x: mpuData.accel.x,
                y: mpuData.accel.y,
                z: mpuData.accel.z
            },
            rotation: {
                x: mpuData.rotation.x,
                y: mpuData.rotation.y
            },
            vibration: vibration,
            mAvg: {
                speed: parseFloat(sma(this.mAvgSpeed, 5)[0] || 0),
                speed2: parseFloat(sma(this.mAvgSpeed2, 5)[0] || 0),
                vibration: parseFloat(sma(this.mAvgVibration, 5)[0] || 0),
                gyro: {
                    x: parseFloat(sma(this.mAvgMCU['gyro']['x'], 5)[0] || 0),
                    y: parseFloat(sma(this.mAvgMCU['gyro']['y'], 5)[0] || 0),
                    z: parseFloat(sma(this.mAvgMCU['gyro']['z'], 5)[0] || 0),
                },
                accel: {
                    x: parseFloat(sma(this.mAvgMCU['accel']['x'], 5)[0] || 0),
                    y: parseFloat(sma(this.mAvgMCU['accel']['y'], 5)[0] || 0),
                    z: parseFloat(sma(this.mAvgMCU['accel']['z'], 5)[0] || 0)
                },
                rotation: {
                    x: parseFloat(sma(this.mAvgMCU['rotation']['x'], 5)[0] || 0),
                    y: parseFloat(sma(this.mAvgMCU['rotation']['y'], 5)[0] || 0)
                }
            }
        };

        this.collectedData.push(data);
    }

    handleSend() {
        if (this.collectedData.length > 0) {
            Aws.publish('sensors', this.collectedData);
            this.pushAvg(this.collectedData);
        }

        this.collectedData = [];
    }

    pushAvg(dataArr) {

        if (this.mAvgSpeed.length > 4) {
            this.mAvgSpeed.shift();
            this.mAvgSpeed2.shift();
            this.mAvgVibration.shift();
            this.mAvgMCU['gyro']['x'].shift();
            this.mAvgMCU['gyro']['y'].shift();
            this.mAvgMCU['gyro']['z'].shift();

            this.mAvgMCU['accel']['x'].shift();
            this.mAvgMCU['accel']['y'].shift();
            this.mAvgMCU['accel']['z'].shift();

            this.mAvgMCU['rotation']['x'].shift();
            this.mAvgMCU['rotation']['y'].shift();
        }

        let data = {
            speed: 0,
            speed2: 0,
            vibration: 0,
            gyro: {
                x: 0,
                y: 0,
                z: 0,
            },
            accel: {
                x: 0,
                y: 0,
                z: 0,
            },
            rotation: {
                x: 0,
                y: 0
            },
        };

        for (let i = 0; i < dataArr.length; i++) {
            data['speed'] += dataArr[i].speed;
            data['speed2'] += dataArr[i].speed2;
            data['vibration'] += dataArr[i].vibration;

            data['gyro']['x'] += dataArr[i].gyro['x'];
            data['gyro']['y'] += dataArr[i].gyro['y'];
            data['gyro']['z'] += dataArr[i].gyro['z'];

            data['accel']['x'] += dataArr[i].accel['x'];
            data['accel']['y'] += dataArr[i].accel['y'];
            data['accel']['z'] += dataArr[i].accel['z'];

            data['rotation']['x'] += dataArr[i].rotation['x'];
            data['rotation']['y'] += dataArr[i].rotation['y'];
        }

        data['speed'] /= dataArr.length;
        data['speed2'] /= dataArr.length;
        data['vibration'] /= dataArr.length;

        data['gyro']['x'] /= dataArr.length;
        data['gyro']['y'] /= dataArr.length;
        data['gyro']['z'] /= dataArr.length;

        data['accel']['x'] /= dataArr.length;
        data['accel']['y'] /= dataArr.length;
        data['accel']['z'] /= dataArr.length;

        data['rotation']['x'] /= dataArr.length;
        data['rotation']['y'] /= dataArr.length;

        this.mAvgSpeed.push(data.speed);
        this.mAvgSpeed2.push(data.speed2);
        this.mAvgVibration.push(data.vibration);

        this.mAvgMCU['gyro']['x'].push(data.gyro.x);
        this.mAvgMCU['gyro']['y'].push(data.gyro.y);
        this.mAvgMCU['gyro']['z'].push(data.gyro.z);

        this.mAvgMCU['accel']['x'].push(data.accel.x);
        this.mAvgMCU['accel']['y'].push(data.accel.y);
        this.mAvgMCU['accel']['z'].push(data.accel.z);

        this.mAvgMCU['rotation']['x'].push(data.rotation.x);
        this.mAvgMCU['rotation']['y'].push(data.rotation.y);
    }
}

module.exports = new Collector();