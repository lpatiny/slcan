'use strict';

const SerialPort = require('serialport');

const SLAdapter = require('./SLAdapter');

async function getAdapters() {
  let serialPortNames = (await SerialPort.list()).filter(
    (entry) => entry.comName && entry.comName.match(/usbmodem|ACM|AMA0/i)
  );

  let adapters = [];
  for (let serialPortName of serialPortNames) {
    const serialPort = new SerialPort(serialPortName.comName, {
      baudRate: 115200
    });

    adapters.push(new SLAdapter(serialPort.comName, serialPort));
  }
  return adapters;
}

module.exports = {
  getAdapters,
  SLAdapter
};
