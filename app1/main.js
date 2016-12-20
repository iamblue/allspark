(function() {

    var application = 'com.my_company.my_application';

    var port = null;

    // document.getElementById('connect').addEventListener('click', function() {
    //     log('chrome.runtime.connectNative')
    console.log(chrome);
    function connectPort() {
        port = chrome.runtime.connectNative(application);

        port.onMessage.addListener(log);

        port.onDisconnect.addListener(function(e) {
            log('unexpected disconnect');

            port = null;
        });
        console.log(port)
    }
    connectPort();
    function disconnectPort() {
        log('port.disconnect');
        port.disconnect(); // this doesn't seem to trigger the onDisconnect event
        port = null;
    }


    const serial = chrome.serial;

var DEVICE_PATH = '/dev/tty.usbmodem1412';
/* Interprets an ArrayBuffer as UTF-8 encoded string data. */
var ab2str = function(buf) {
  var bufView = new Uint8Array(buf);
  var encodedString = String.fromCharCode.apply(null, bufView);
  return decodeURIComponent(escape(encodedString));
};

/* Converts a string to UTF-8 encoding in a Uint8Array; returns the array buffer. */
var str2ab = function(str) {
  var encodedString = unescape(encodeURIComponent(str));
  var bytes = new Uint8Array(encodedString.length);
  for (var i = 0; i < encodedString.length; ++i) {
    bytes[i] = encodedString.charCodeAt(i);
  }
  return bytes.buffer;
};

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

var SerialConnection = function() {
  this.connectionId = -1;
  this.lineBuffer = "";
  this.boundOnReceive = this.onReceive.bind(this);
  this.boundOnReceiveError = this.onReceiveError.bind(this);
  this.onConnect = new chrome.Event();
  this.onReadLine = new chrome.Event();
  this.onError = new chrome.Event();
};

SerialConnection.prototype.onConnectComplete = function(connectionInfo) {
  console.log(connectionInfo)
  if (!connectionInfo) {
    log("Connection failed.");
    return;
  }
  this.connectionId = connectionInfo.connectionId;
  chrome.serial.onReceive.addListener(this.boundOnReceive);
  chrome.serial.onReceiveError.addListener(this.boundOnReceiveError);
  this.onConnect.dispatch();
};

SerialConnection.prototype.onReceive = function(receiveInfo) {
    console.log(123123);
  if (receiveInfo.connectionId !== this.connectionId) {
    return;
  }

  this.lineBuffer += ab2str(receiveInfo.data);

  var index;

  while ((index = this.lineBuffer.indexOf('\n')) >= 0) {
    var line = this.lineBuffer.substr(0, index + 1);
    this.onReadLine.dispatch(line);
    this.lineBuffer = this.lineBuffer.substr(index + 1);
    console.log(this.lineBuffer);
  }

};

SerialConnection.prototype.onReceiveError = function(errorInfo) {
  if (errorInfo.connectionId === this.connectionId) {
    this.onError.dispatch(errorInfo.error);
  }
};

SerialConnection.prototype.connect = function(path) {
    console.log(123123);
  serial.connect(path, this.onConnectComplete.bind(this))
};

SerialConnection.prototype.send = function(msg) {
  if (this.connectionId < 0) {
    throw 'Invalid connection';
  }
  serial.send(this.connectionId, str2ab(msg), function() {});
};

SerialConnection.prototype.disconnect = function() {
  if (this.connectionId < 0) {
    throw 'Invalid connection';
  }
  serial.disconnect(this.connectionId, function() {});
};

var connection = new SerialConnection();

connection.onConnect.addListener(function() {
  log('connected to: ' + DEVICE_PATH);
  // connection.send("hello arduino");
});

connection.onReadLine.addListener(function(line) {
  log('read line: ' + line);
});

// connection.onError(function(err) {
//     console.log(err);
// })
connection.connect(DEVICE_PATH);

    var examples = {
        readdir: { readdir: '/' },
    };

    Array.prototype.slice.call(document.querySelectorAll('[data-example]')).forEach(function(example) {
        example.addEventListener('click', function() {
            document.getElementById('msg').value = JSON.stringify(examples[example.dataset.example]);
        });
    });

    document.getElementById('send').addEventListener('click', function() {
        var json = document.getElementById('msg').value;
        var msg;


        try {
            msg = JSON.parse(json);
        } catch (err) {
            return log('invalid JSON: ' + json);
        }
        console.log('=======');
        console.log(msg);
        console.log('=======');

        if (port) {
            console.log(port);
            log('port.postMessage123');
            console.log(123123);
            port.postMessage(msg);
        } else {
            console.log(12312322222);
            log('chrome.runtime.sendNativeMessage');
            chrome.runtime.sendNativeMessage(application, msg, log);
        }
    });

    document.getElementById('clear').addEventListener('click', function() {
        document.getElementById('log').innerHTML = '';
    });

    function log(msg) {
        console.log(msg);

        var e = document.createElement('pre');
        e.appendChild(document.createTextNode(typeof msg === 'object' ? JSON.stringify(msg) : msg));
        document.getElementById('log').appendChild(e);
    }

    // List all device serial port
    var onGetDevices = function(ports) {
      for (var i=0; i<ports.length; i++) {
        console.log(ports[i]);
      }
    }

    chrome.serial.getDevices(onGetDevices);
})();
