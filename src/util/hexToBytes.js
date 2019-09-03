'use strict';

/**
 * Concert a string containing hexadecimal digits to
 * an array of bytes
 * @param {string} text
 * @return {array} array of bytes
 */

function hexToBytes(text) {
  return text
    .split(/(..)/)
    .filter((value) => value)
    .map((value) => Number(`0x${value}`));
}

module.exports = hexToBytes;
