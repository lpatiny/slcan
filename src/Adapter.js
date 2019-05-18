'use strict';

const EventEmitter = require('events');

const updateNodeInfo = require('./updateNodeInfo');
const Node = require('./Node');

const debug = require('debug')('slcan.adapter');

const processReceivedData = require('./processReceivedData');

const STATUS_OPENING = 1;
const STATUS_OPENED = 2;
const STATUS_CLOSED = 3;
const STATUS_ERROR = 10;

class Adapter extends EventEmitter {
  constructor(portName, serialPort, options = {}) {
    super();
    const { nodeID = 127 } = options;
    this.status = STATUS_OPENING;
    this.portName = portName;
    this.serialPort = serialPort;
    this.nodes = {};

    if (!isNaN(nodeID)) {
      this.adapterNode = new Node(nodeID, this);
    }

    serialPort.on('open', (open) => this.open(open));
    serialPort.on('data', (data) => this.data(data));
    serialPort.on('error', (error) => this.error(error));
    serialPort.on('close', (close) => this.close(close));

    updateNodeInfo(this);
  }

  async open() {
    debug(`Open ${this.portName}`);
    this.serialPort.write('S3\r');
    this.serialPort.write('O\r');
    this.status = STATUS_OPENED;
  }

  close() {
    debug(`Close ${this.portName}`);
    this.status = STATUS_CLOSED;
  }

  error(error) {
    debug(`Error ${this.portName}`);
    debug(error);
    this.status = STATUS_ERROR;
  }

  data(data) {
    debug(`Data ${this.portName}: ${data}`);
    processReceivedData(data, this);
  }

  update(sourceNodeID) {
    if (!this.nodes[sourceNodeID]) {
      this.nodes[sourceNodeID] = new Node(sourceNodeID, this);
    }
    this.nodes[sourceNodeID].seen();
  }

  write(strings) {
    if (!Array.isArray(strings)) strings = [strings];
    for (let string of strings) {
      this.serialPort.write(string);
    }
  }
}

module.exports = Adapter;
