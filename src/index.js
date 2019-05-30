'use strict';

const SerialPort = require('serialport');

const SLAdapter = require('./SLAdapter');

const adapters = {};

async function list() {
  let currentAdapters = (await SerialPort.list()).filter(
    (entry) => entry.comName && entry.comName.match(/usbmodem|ACM|AMA0/i)
  );
  for (let currentAdapter of currentAdapters) {
    const serialPort = new SerialPort(currentAdapter.comName, {
      baudRate: 115200
    });

    if (!adapters[currentAdapter.comName]) {
      adapters[currentAdapter.comName] = new SLAdapter(
        currentAdapter.comName,
        serialPort
      );
    }
  }
}

list();

module.exports = {
  adapters
};
