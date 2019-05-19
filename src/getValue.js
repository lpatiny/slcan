'use strict';

const delay = require('delay');
const debug = require('debug')('slcan.updateNodeInfo');

async function getValue(adapter) {
  while (true) {
    let keys = Object.keys(adapter.nodes);
    debug(`Get value for ${keys.length} node(s)`);
    for (let key of keys) {
      if (adapter.adapterNode) {
        adapter.adapterNode.sendRequest(
          { index: 5, value: { empty: true }, name: [] },
          'uavcan.protocol.param.GetSet',
          adapter.nodes[key].nodeID
        );
      }
    }
    await delay(500);
  }
}

module.exports = getValue;
