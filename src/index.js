'use strict';

const SerialPort = require('serialport');
const delay = require('delay');

const Adapter = require('./Adapter');

const adapters = {};

async function list() {
  let currentAdapters = (await SerialPort.list()).filter(
    (entry) => entry.manufacturer && entry.manufacturer.match(/octanis/i)
  );
  for (let currentAdapter of currentAdapters) {
    if (!adapters[currentAdapter.comName]) {
      adapters[currentAdapter.comName] = new Adapter(currentAdapter.comName);
    }
    let adapter = adapters[currentAdapter.comName];
    const port = new SerialPort(currentAdapters[0].comName);

    port.on('open', (open) => adapter.open(open));

    port.on('data', (data) => adapter.data(data));

    port.on('error', (error) => adapter.error(error));

    port.on('close', (close) => adapter.opeclose(close));
  }
}

list();
