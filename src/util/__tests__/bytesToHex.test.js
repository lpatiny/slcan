'use strict';

const bytesToHex = require('../bytesToHex');

describe('bytesToHex', () => {
  it('basic test', () => {
    expect(bytesToHex([0, 0, 0x10, 0x20, 0, 0])).toBe('000010200000');
  });
});
