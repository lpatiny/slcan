'use strict';

const { getAdapters } = require('../src');

// we retrieve all the adapters
getAdapters().then(async (adapters) => {
  // for each adapter we listen to events
  // the events can be uavcan (a decoded packet) or frame
  for (let adapter of adapters) {
    adapter.on('uavcan', (result) => {
      if (result.value.dataTypeFullID !== 'uavcan.protocol.NodeStatus') {
        return;
      }
      console.log(
        `${Date.now()
        } - ` +
          `NodeID: ${result.value.sourceNodeID} - uptime: ${
            result.value.value.uptimeSec
          }`
      );
    });
  }
});
