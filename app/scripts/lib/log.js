global.log = '';
import AppDispatcher from '../dispatcher/appDispatcher.js';

module.exports = {
  parseSerialPorts: function(data) {
    console.log(data);
    // 監聽只能某個 connect id 出來的 data
    global.log += this.convertArrayBufferToString(data);
    return AppDispatcher.dispatch({
      log: global.log,
    });
  },
  convertArrayBufferToString: function(buf) {
    const bufView = new Uint8Array(buf);
    const encodedString = String.fromCharCode.apply(null, bufView);
    return decodeURIComponent(encodedString);
  },
  clear: function() {
    global.log = '';
    return AppDispatcher.dispatch({
      log: global.log,
    });
  },
  receive: function(msg) {
    // console.log(msg);
    if (msg.log === 'exit') {
      AppDispatcher.dispatch({
        log: global.log,
      });
      global.log = '';
    } else if (msg.progress) {
      if (msg.progress > 100) {
        msg.progress = 100;
      }
      return AppDispatcher.dispatch({
        progress: msg.progress,
      });
    } else {
      global.log += msg.log;
      return AppDispatcher.dispatch({
        log: global.log,
      });
    }
  }
}