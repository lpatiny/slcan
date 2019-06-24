'use strict';

const debug = require('debug')('slcan/listenFrames');

const { updateAdapters } = require('../src');

// we retrieve all the adapters
updateAdapters().then(async (adapters) => {
  debug(`Found adapters: ${adapters}`);
  // for each adapter we listen to events
  // the events can be uavcan (a decoded packet) or frame
  for (let adapter of adapters) {
    adapter.on('frame', (result) => {
      console.log(result);
    });
  }
});
