const i2c = require('i2c-bus');
const MPU6050 = require('i2c-mpu6050');

const address = 0x68;

class MPU {

    constructor() {
        let i2c1 = i2c.openSync(1);

        this.sensor = new MPU6050(i2c1, address);
    }

    getData() {
        return this.sensor.readSync();
    }
}

module.exports = new MPU();