global.port = null;

import log from './log.js';

module.exports = {
    connect: function() {
        global.port = chrome.runtime.connectNative(global.application);

        global.port.onMessage.addListener(log.receive);

        global.port.onDisconnect.addListener(function(e) {
            console.log('unexpected disconnect');
            global.port = null;
            global.port = chrome.runtime.connectNative(global.application);
        });
    },
    disconnect: function() {
        log('port.disconnect');
        global.port.disconnect(); // this doesn't seem to trigger the onDisconnect event
        global.port = null;
    }
};