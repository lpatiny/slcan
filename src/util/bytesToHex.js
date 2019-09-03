'use strict';

/**
 * Convert an array of bytes to an hexadecimal string.
 * This method will take care to always give 2 hexadecimal
 * digits for each byte even if it is 0.
 * @param {array} bytes
 * @return {string} string of hexadecimal digits
 */

function bytesToHex(bytes) {
  let text = '';
  for (let byte of bytes) {
    text += Number(byte & 255)
      .toString(16)
      .padStart(2, '0');
  }
  return text;
}

module.exports = bytesToHex;
