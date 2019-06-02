'use strict';

const { getAdapters } = require('../src');

// we retrieve all the adapters
getAdapters().then(async (adapters) => {
  // for each adapter we listen to events
  // the events can be uavcan (a decoded packet) or frame
  for (let adapter of adapters) {
    adapter.on('frame', (result) => {
      console.log(result);
    });
  }
});
