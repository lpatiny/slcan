'use strict';

const { updateAdapters } = require('../src');

// we retrieve all the adapters
updateAdapters().then(async (adapters) => {
  // for each adapter we listen to events
  // the events can be uavcan (a decoded packet) or frame
  for (let adapter of adapters) {
    adapter.on('frame', (result) => {
      console.log(result);
    });
  }
});
