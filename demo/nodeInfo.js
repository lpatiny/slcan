'use strict';

const delay = require('delay');
const { Data } = require('uavcan');

const { getAdapters } = require('../src');

// one UAVCAN you need to create an instance of Data in order to communicate with teh devices
// You can construct Data from an object or a byte array
let data = new Data({}, 'uavcan.protocol.GetNodeInfo', {
  isService: true,
  isRequest: true
});

// we retrieve all the adapters
getAdapters().then(async (adapters) => {
  // for each adapter we listen to events
  // the events can be uavcan (a decoded packet) or frame
  for (let adapter of adapters) {
    adapter.on('uavcan', (result) => {
      if (result.value.dataTypeFullID !== 'uavcan.protocol.GetNodeInfo') {
        return;
      }
      console.log(result.value);
    });
  }
  // every 10 seconds we call all the registered nodes and ask them for information
  while (true) {
    for (let adapter of adapters) {
      for (let node in adapter.nodes) {
        adapter.adapterNode.send(data, { destinationNodeID: node });
      }
    }
    await delay(10000);
  }
});
