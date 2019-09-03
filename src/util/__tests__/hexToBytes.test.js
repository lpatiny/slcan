'use strict';

const hexToBytes = require('../hexToBytes');

describe('hexToBytes', () => {
  it('basic test', () => {
    expect(hexToBytes('000010200000')).toStrictEqual([0, 0, 0x10, 0x20, 0, 0]);
  });
});
