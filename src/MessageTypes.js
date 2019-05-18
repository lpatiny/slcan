'use strict';

const MESSAGE_FRAME = 1;
const ANONYMOUS_MESSAGE_FRAME = 2;
const SERVICE_FRAME = 3;

function getMessageTypeLabel(messageType) {
  switch (messageType) {
    case MESSAGE_FRAME:
      return 'Message frame';
    case ANONYMOUS_MESSAGE_FRAME:
      return 'Anonymous message frame';
    case SERVICE_FRAME:
      return 'Service frame';
    default:
  }
  return '';
}

module.exports = {
  MESSAGE_FRAME,
  ANONYMOUS_MESSAGE_FRAME,
  SERVICE_FRAME,
  getMessageTypeLabel
};
