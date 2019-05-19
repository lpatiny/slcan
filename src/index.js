'use strict';

const EventEmitter = require('events');

const SerialPort = require('serialport');

const Adapter = require('./Adapter');

const adapters = {};

class SlcanEventEmitter extends EventEmitter {}

const slcanEventEmitter = new SlcanEventEmitter();

async function list() {
  let currentAdapters = (await SerialPort.list()).filter(
    (entry) => entry.comName && entry.comName.match(/usbmodem/i)
  );
  for (let currentAdapter of currentAdapters) {
    const serialPort = new SerialPort(currentAdapter.comName);

    slcanEventEmitter.emit('serial', {
      event: 'New port',
      value: {
        comName: currentAdapter.comName
      }
    });

    if (!adapters[currentAdapter.comName]) {
      adapters[currentAdapter.comName] = new Adapter(
        currentAdapter.comName,
        serialPort,
        slcanEventEmitter
      );
    }
  }
}

list();

module.exports = slcanEventEmitter;
