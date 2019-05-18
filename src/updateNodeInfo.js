'use strict';

const delay = require('delay');
const debug = require('debug')('slcan.updateNodeInfo');

async function updateNodeInfo(adapter) {
  while (true) {
    let keys = Object.keys(adapter.nodes);
    debug(`Update node info for ${keys.length} node(s)`);
    for (let key of keys) {
      if (adapter.adapterNode) {
        adapter.adapterNode.sendRequest(
          {},
          'uavcan.protocol.GetNodeInfo',
          adapter.nodes[key].nodeID
        );
      }
    }
    await delay(5000);
  }
}

module.exports = updateNodeInfo;
