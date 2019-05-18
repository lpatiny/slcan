'use strict';

const parseUavcanFrame = require('../parseUavcanFrame');

const { parseMessage } = require('uavcan');

describe('parseUavcanFrame', () => {
  it('1801550c8f15f0100000000df', () => {
    let result = parseUavcanFrame('1801550c8f15f0100000000df');
    expect(result).toStrictEqual({
      messageType: 1,
      priority: 24,
      isService: 0,
      sourceNodeID: 12,
      messageTypeDescription: 'Message frame',
      dataTypeID: 341,
      dataLength: 8,
      data: 'f15f0100000000',
      startTransfer: 1,
      endTransfer: 1,
      toggleBit: 0,
      transferID: 31
    });
    expect(parseMessage(result.data, result.dataTypeID)).toStrictEqual({
      uptimeSec: 90097,
      health: 0,
      mode: 0,
      subMode: 0,
      vendorSpecificStatusCode: 0
    });
  });

  it.only('1f018cff0c0', () => {
    let result = parseUavcanFrame('1f018cff0c0');
    console.log('1f018cff0c0', result);
    console.log(parseMessage(result.data, result.dataTypeID));
    expect(42).toBe(42);
  });
});
