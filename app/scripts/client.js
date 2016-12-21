require('babel/polyfill');
require('../styles/main.css');

import main from '../styles/main.css';
import React from 'react';
import { default as dom } from 'react-dom';
var SerialPort = require("browser-serialport").SerialPort;

/* flux */
import AppStore from './stores/appStore.js';
function appState() {
  return AppStore.init();
}

/* mtk-ui */
import InputSelect from 'mtk-ui/lib/InputSelect';
import InputText from 'mtk-ui/lib/InputText';
import Button from 'mtk-ui/lib/Button';
import CodeBlock from 'mtk-ui/lib/CodeBlock';
import Progressbar from 'mtk-ui/lib/Progressbar';


/* mtk-icon */
import { MiFlip } from 'mtk-icon';

/* chrome lib */
import Port from './lib/port.js';
import Serial from './lib/serial.js';
import Log from './lib/log.js';

/* application setting */
global.application = 'com.my_company.my_application';
global.serialPortConectionId = null;

/* init connect */
Port.connect();

const baudrates = [
  {
    value: '115200',
    children: '115200',
  },
  {
    value: '57600',
    children: '57600',
  },
  {
    value: '9600',
    children: '9600',
  },
]

export default class App extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      serialPortsValue: '',
      serialPorts: [],
      baudrateValue: '115200',
      filePathValue: './new_uploader/sample.bin',
    };

    this._onChange = this._onChange.bind(this);
    this.onDownloadFW = this.onDownloadFW.bind(this);
    this.onScreenLog = this.onScreenLog.bind(this);
    this.onRefreshSerialPort = this.onRefreshSerialPort.bind(this);
  }

  getInitialState() {
    return appState();
  }

  componentDidMount() {
    this.onRefreshSerialPort();
    AppStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    AppStore.removeChangeListener(this._onChange);
  }

  onRefreshSerialPort() {
    const _this = this;
    Serial
    .onGetSerialPorts()
    .then(function(ports) {
      ports.forEach((port) => {
        port.value = port.path;
        port.children = port.path;
      });
      console.log(ports);
      return _this.setState({
        serialPorts: ports,
      });
    })
    .catch(function(err) {
      console.log(err);
    });
  }

  onDownloadFW() {
    Log.clear();

    if (this.state.serialPort) {
      this.state.serialPort.close();
    }

    global.port.postMessage({
      type: 'download',
      filePath: this.state.filePathValue,
      serialPortsValue: this.state.serialPortsValue,
    });
  }

  onScreenLog() {
    Log.clear();

    if (this.state.serialPort) {
      this.state.serialPort.close();
    }

    let _this = this;
    if (!global.serialPortConectionId) {
      let serialPort = new SerialPort(_this.state.serialPortsValue, {
        baudrate: Number(_this.state.baudrateValue),
      });

      serialPort.on("open", function () {
        console.log('open');

        _this.setState({
          serialPort: serialPort,
        });

        serialPort.on('data', function(data) {
          Log.parseSerialPorts(data);
        });

        serialPort.on('close', function() {
          _this.setState({
            serialPort: null,
          });
        });

      });
    }
  }

  _onChange() {
    this.setState(appState());
  }

  render() {
    return (
      <div>
        <div className={main.menuBar}>
        baudrate:
        <InputSelect
          style={{ width: 200 }}
          items={baudrates}
          value={this.state.baudrateValue}
          placeholder="Choose a baudrate!"
          onChange={(e, value) => {
            this.setState({ baudrateValue: value });
          }}
        />
        path:
        <InputText
          value={this.state.filePathValue}
          placeholder="Input your file path."
          onChange={(e, value) => {
            this.setState({ filePathValue: value });
          }}
        />
        </div>
        <div className={main.menuBar}>
          <InputSelect
            style={{ width: 435 }}
            items={this.state.serialPorts}
            value={this.state.serialPortsValue}
            placeholder="Choose a port!"
            onChange={(e, value) => {
              this.setState({ serialPortsValue: value });
            }}
          />
          <Button
            square
            onClick={this.onRefreshSerialPort}
          >
            <MiFlip size="1.5em" />
          </Button>
          <Button
            onClick={this.onDownloadFW}
          >
          Download
          </Button>
          <Button
            onClick={this.onScreenLog}
          >
          log
          </Button>
        </div>
        <div>
          <Progressbar now={this.state.progress} />
        </div>
        <div>
          <CodeBlock
            style={{
              maxHeight: 446,
              height: 446,
              width: 640,
              borderRadius: 3,
              background: '#FFFFFF',
            }}
            defaultValue={this.state.log}
            value={this.state.log}
            config={{
              lineNumbers: true,
              styleActiveLine: true,
              readOnly: true,
            }}
            copy={false}
          />
        </div>
      </div>
    );
  }
}

if (document && document.getElementById('app')) {
  dom.render(
    <App />,
    document.getElementById('app')
  );
}
