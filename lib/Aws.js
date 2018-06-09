const awsIot = require('aws-iot-device-sdk');
const clientId = "temp";
const host = "a2rptvoir3hl15.iot.eu-west-1.amazonaws.com";
const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;
const opts = { flatten: true,
fields: [/*"time",*/ "speed", /*"speed2",*/"gyro.x","gyro.y","gyro.z","accel.x","accel.y","accel.z","rotation.x","rotation.y","vibration",/*"mAvg.speed","mAvg.speed2","mAvg.vibration","mAvg.gyro.x","mAvg.gyro.y","mAvg.gyro.z","mAvg.accel.x","mAvg.accel.y","mAvg.accel.z","mAvg.rotation.x","mAvg.rotation.y"*/]};

class Aws {
    constructor() {
        this.device = awsIot.device({
            keyPath: "credentials/philip_computer.private.key",
            certPath: "credentials/philip_computer.cert.pem",
            caPath: "credentials/root-CA.crt",
            clientId: clientId,
            host: host
        });
    }

    publish(topic, data) {
        const parser = new Json2csvParser(opts);
        let csv = parser.parse(data);

        data.forEach(function (val) {
            fs.appendFileSync(topic + ".json", JSON.stringify(val) + ",");
        });

        console.log(csv);

        this.device.publish(topic, csv);
    }
}

const aws = new Aws();

module.exports = aws;