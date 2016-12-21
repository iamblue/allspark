global.port = null;
import AppDispatcher from '../dispatcher/appDispatcher.js';
import log from './log.js';

module.exports = {
    connect: function() {
        global.port = chrome.runtime.connectNative(global.application);
        AppDispatcher.dispatch({
          connected: true,
        });
        global.port.onMessage.addListener(log.receive);
        const _this = this;

        global.port.onDisconnect.addListener(function(e) {
            console.log('unexpected disconnect');
            global.port = null;
            AppDispatcher.dispatch({
              connected: false,
            });
            _this.connect();
       });
    },
    disconnect: function() {
        log('port.disconnect');
        global.port.disconnect(); // this doesn't seem to trigger the onDisconnect event
        global.port = null;
    }
};