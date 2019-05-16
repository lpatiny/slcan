'use strict';

const EventEmitter = require('events');

const debug = require('debug')('slcan.adapter');

const parseFrame = require('./parseFrame');

const STATUS_OPENING = 1;
const STATUS_OPENED = 2;
const STATUS_CLOSED = 3;
const STATUS_ERROR = 10;

class Adapter extends EventEmitter {
  constructor(port) {
    super();
    this.status = STATUS_OPENING;
    this.port = port;
    this.devices = [];
  }

  open() {
    debug(`Open ${this.port}`);
    this.status = STATUS_OPENED;
  }

  close() {
    debug(`Close ${this.port}`);
    this.status = STATUS_CLOSED;
  }

  error(error) {
    debug(`Error ${this.port}`);
    debug(error);
    this.status = STATUS_ERROR;
  }

  data(data) {
    debug(`Data ${this.port}: ${data}`);
    let parsed = parseFrame(data);
  }
}

module.exports = Adapter;
