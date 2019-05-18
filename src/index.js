'use strict';

const SerialPort = require('serialport');

const Adapter = require('./Adapter');

const adapters = {};

async function list() {
  let currentAdapters = (await SerialPort.list()).filter(
    (entry) => entry.comName && entry.comName.match(/usbmodem/i)
  );
  for (let currentAdapter of currentAdapters) {
    const serialPort = new SerialPort(currentAdapter.comName);

    if (!adapters[currentAdapter.comName]) {
      adapters[currentAdapter.comName] = new Adapter(
        currentAdapter.comName,
        serialPort
      );
    }
  }
}

list();
