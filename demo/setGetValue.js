'use strict';

const delay = require('delay');
const { Data } = require('uavcan');

const { updateAdapters } = require('../src');

// we retrieve all the adapters
updateAdapters().then(async (adapters) => {
  // for each adapter we listen to events
  // the events can be uavcan (a decoded packet) or frame
  for (let adapter of adapters) {
    adapter.on('uavcan', (result) => {
      if (result.value.dataTypeFullID !== 'uavcan.protocol.param.GetSet') {
        return;
      }
      console.log(`Retrieved value: ${result.value.value.value.integerValue}`);
    });
  }

  while (true) {
    for (let adapter of adapters) {
      for (let node in adapter.nodes) {
        // one UAVCAN you need to create an instance of Data in order to communicate with teh devices
        // You can construct Data from an object or a byte array
        {
          let random = Math.floor(Math.random() * 1024);
          let data = new Data(
            {
              index: 1,
              value: {
                integerValue: random
              },
              nameStr: ''
            },
            'uavcan.protocol.param.GetSet',
            { isService: true, isRequest: true }
          );
          adapter.adapterNode.send(data, { destinationNodeID: node });
          console.log(`Set node: ${node} to value: ${random}`);
        }
        await delay(2000);
        {
          let data = new Data(
            {
              index: 1,
              value: { empty: true },
              nameStr: ''
            },
            'uavcan.protocol.param.GetSet',
            { isService: true, isRequest: true }
          );
          adapter.adapterNode.send(data, { destinationNodeID: node });
        }
        console.log(`Set node: ${node} to empty to retrieve value`);
        await delay(2000);
      }
    }
    await delay(2000);
  }
});
