'use strict';

const delay = require('delay');
require('fast-text-encoding'); // polyfills TextEncoder for node 10

const {
  bytesToHex,
  hexToBytes,
  parseFrame,
  Node,
  DefaultAdapter
} = require('uavcan');
const debug = require('debug')('slcan.adapter');

const STATUS_OPENING = 1;
const STATUS_OPENED = 2;
const STATUS_CLOSED = 3;
const STATUS_ERROR = 10;

class SLAdapter extends DefaultAdapter {
  constructor(portName, serialPort, options = {}) {
    super();
    const { nodeID = 127 } = options;
    this.status = STATUS_OPENING;
    this.portName = portName;
    this.serialPort = serialPort;

    if (!isNaN(nodeID)) {
      this.adapterNode = new Node(nodeID, this);
    }

    serialPort.on('open', (open) => this.open(open));
    serialPort.on('data', (data) => this.data(data));
    serialPort.on('error', (error) => this.error(error));
    serialPort.on('close', (close) => this.close(close));
  }

  async open() {
    debug(`Open ${this.portName}`);
    await delay(1000);
    this.serialPort.write('S3\r');
    this.serialPort.write('O\r');
    this.serialPort.write('Z0\r');
    this.status = STATUS_OPENED;
    this.emit('adapter', {
      event: 'Open',
      value: {}
    });
  }

  close() {
    debug(`Close ${this.portName}`);

    this.serialPort.flush(() => {
      this.serialPort.close((err) => {
        if (err) {
          debug('port could not be closed');
          debug(err);
          this.emit('adapter', {
            event: 'closeError',
            value: err
          });
        } else {
          debug('port closed');
          this.status = STATUS_CLOSED;
          this.emit('adapter', {
            event: 'closed',
            value: {}
          });
        }
      });
    });
  }

  error(error) {
    debug(`Error ${this.portName}`);
    debug(error);
    this.status = STATUS_ERROR;
    this.emit('adapter', {
      event: 'Error',
      value: error
    });
  }

  data(buffer) {
    let string = new TextDecoder().decode(buffer);
    debug(`Data ${this.portName}: ${string}`);
    try {
      processReceivedData(string, this);
      this.emit('adapter', {
        event: 'received',
        value: string
      });
    } catch (e) {
      debug(e);
    }
  }

  write(strings) {
    if (!Array.isArray(strings)) strings = [strings];
    for (let string of strings) {
      debug(`Write serial frame: ${string}`);
      this.serialPort.write(`${string}\r`);
    }
  }

  sendFrame(frame) {
    let text = 'T';
    text += frame.frameID.toString(16).padStart(8, '0');
    text += frame.payload.length;
    text += bytesToHex(frame.payload);
    this.write(text);
    debug(`sendFrame: ${text}`);
    this.frameSent(frame, text);
  }

  receiveFrame(text) {
    let frameID = Number(`0x0${text.substr(0, 8)}`);
    let payloadLength = Number(text.substr(8, 1));
    let payload = hexToBytes(text.substr(9));
    if (payloadLength !== payload.length) {
      throw Error(`Wrong length for received frame: ${text}`);
    }
    let frame = parseFrame(frameID, payload);
    this.frameReceived(frame, text);
  }
}

let leftOver = ''; // the part that was left over from previous data
function processReceivedData(string, adapter) {
  // eslint-disable-next-line no-control-regex
  string = leftOver + string.replace(/\x07/g, '\x07\r');
  while (string.includes('\r')) {
    let position = string.indexOf('\r');
    let currentString = string.substring(0, position);
    string = string.substring(position + 1);
    let type = currentString.charAt(0);
    debug(`processReceiveData: ${currentString}`);
    switch (type) {
      case 'T':
        //   currentString = currentString.substring(0, currentString.length - 4);
        try {
          adapter.receiveFrame(currentString.substring(1));
        } catch (e) {
          console.log(e);
        }

        break;
      case '':
        debug('Received carriage return');
        break;
      case '\u0007':
        debug('Received ERROR');
        break;
      default:
        console.log(`Unknown type of frame: "${currentString}"`);
    }
  }
  leftOver = string;
}

module.exports = SLAdapter;
