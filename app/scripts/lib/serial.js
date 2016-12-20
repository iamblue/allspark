module.exports = {
  onGetSerialPorts: function() {
    return new Promise(function(resolve, reject) {
      chrome.serial.getDevices(function(ports){
        resolve(ports);
      });
    });
  },
}