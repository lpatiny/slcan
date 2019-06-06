'use strict';

const SerialPort = require('serialport');

const SLAdapter = require('./SLAdapter');

let adapters = [];

async function updateAdapters() {
  let serialPortNames = (await SerialPort.list()).filter(
    (entry) => entry.comName && entry.comName.match(/usbmodem|ACM|AMA0|BT328/i)
  );
  for (let serialPortName of serialPortNames) {
    const serialPort = new SerialPort(serialPortName.comName, {
      baudRate: 115200
    });

    adapters.push(new SLAdapter(serialPort.comName, serialPort));
  }
  return adapters;
}

updateAdapters();

module.exports = {
<<<<<<< Updated upstream
  getAdapters,
  SLAdapter
=======
  updateAdapters,
  adapters
>>>>>>> Stashed changes
};
