require('babel/polyfill');
require('../styles/main.css');

import main from '../styles/main.css';
import React from 'react';
import { default as dom } from 'react-dom';
var SerialPort = require("browser-serialport").SerialPort;

/* flux */
import AppStore from './stores/appStore.js';
import AppDispatcher from './dispatcher/appDispatcher.js';

function appState() {
  return AppStore.init();
}

/* mtk-ui */
import InputForm from 'mtk-ui/lib/InputForm';
import InputSelect from 'mtk-ui/lib/InputSelect';
import InputText from 'mtk-ui/lib/InputText';
import InputRadio from 'mtk-ui/lib/InputRadio';
import Button from 'mtk-ui/lib/Button';
import CodeBlock from 'mtk-ui/lib/CodeBlock';
import Hr from 'mtk-ui/lib/CodeBlock';
import Progressbar from 'mtk-ui/lib/Progressbar';
import InputGroup from 'mtk-ui/lib/InputGroup';
import Dialog from 'mtk-ui/lib/Dialog';
import DialogHeader from 'mtk-ui/lib/DialogHeader';
import DialogBody from 'mtk-ui/lib/DialogBody';
import DialogFooter from 'mtk-ui/lib/DialogFooter';
import Select from 'mtk-ui/lib/Select';

/* mtk-icon */
import {
  MiFlip,
  MiSetting,
  MiDiagnosis,
  MiFotaPuch,
  MiSyncAlert,
  MiStatusWait,
  MiCircleLoadingAnimation,
} from 'mtk-icon';

/* chrome lib */
import Port from './lib/port.js';
import Serial from './lib/serial.js';
import Log from './lib/log.js';

/* application setting */
global.application = 'com.my_company.my_application';
global.serialPort = null;

import Package from '../../package.json';
/* init connect */

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
];

export default class App extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      settingDialogShow: false,
      connectWithComputerDialogShow: false,
      serialPortsValue: '',
      serialPorts: [],
      baudrateValue: '115200',
      filePathValue: './new_uploader/sample.bin',
    };

    this._onChange = this._onChange.bind(this);
    this.onDownloadFW = this.onDownloadFW.bind(this);
    this.onScreenLog = this.onScreenLog.bind(this);
    this.onRefreshSerialPort = this.onRefreshSerialPort.bind(this);
    this.openSettingDialog = this.openSettingDialog.bind(this);
    this.closeSettingDialog = this.closeSettingDialog.bind(this);
    this.onClearLog = this.onClearLog.bind(this);
    this.openConnectWithComputerDialog = this.openConnectWithComputerDialog.bind(this);
    this.closeConnectWithComputerDialog = this.closeConnectWithComputerDialog.bind(this);
  }

  getInitialState() {
    return appState();
  }

  componentDidMount() {
    const _this = this;
    chrome.storage.sync.get('baudrateValue', function(result){
      _this.setState({ baudrateValue: result.baudrateValue });
    });
    chrome.storage.sync.get('serialPortsValue', function(result){
      _this.setState({serialPortsValue: result.serialPortsValue});
    });
    chrome.storage.sync.get('filePathValue', function(result){
      _this.setState({filePathValue: result.filePathValue});
    });
    Port.connect();
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
    if (global.serialPort) {
      global.serialPort.close();
    }
    try {
      // Port.connect();
      global.port.postMessage({
        type: 'download',
        file: this.state.filePathValue,
        serial: this.state.serialPortsValue,
      });
    } catch (e) {
      console.log(e);
      AppDispatcher.dispatch({
        log: this.state.log + '\n Cannot connect to your computer!',
      });
      return this.setState({
        connectWithComputerDialogShow: true,
      });
    }
  }

  onScreenLog() {
    Log.clear();

    if (global.serialPort) {
      global.serialPort.close();
    }

    const _this = this;

    let serialPort = new SerialPort(_this.state.serialPortsValue, {
      baudrate: Number(_this.state.baudrateValue),
    });

    serialPort.on('open', function () {
      // console.log('open');
      global.serialPort = serialPort;

      serialPort.on('data', function(data) {
        Log.parseSerialPorts(data);
      });

      serialPort.on('close', function() {
        global.serialPort = null;
      });

    });
  }

  openSettingDialog() {
    this.setState({ settingDialogShow: true });
  }

  closeSettingDialog() {
    this.setState({ settingDialogShow: false });
  }

  openConnectWithComputerDialog() {
    this.setState({ connectWithComputerDialogShow: true });
  }

  closeConnectWithComputerDialog() {
    this.setState({ connectWithComputerDialogShow: false });
  }

  onClearLog() {
    Log.clear();
  }

  _onChange() {
    this.setState(appState());
  }

  render() {
    let connectWithComputerDialog = (
      <Dialog
        show={this.state.connectWithComputerDialogShow}
        size="large"
        styles={{ zIndex: 999 }}
        onHide={this.closeConnectWithComputerDialog}
      >
        <DialogHeader>
          <div><MiSyncAlert style={{ marginRight: 5 }} />Connect with your computer</div>
        </DialogHeader>
        <DialogBody>
          <p>若出現此圖示，及代表此 chrome app 尚未與您的電腦做連接</p>
          <span>Windows</span>
          <ul>
            <li>下載:</li>
            <li>解壓縮檔案後，放置桌面</li>
            <li>進去此資料夾，並點擊 register.bat</li>
          </ul>
          <span>Mac/Linux</span>
          <ul>
            <li>下載:</li>
            <li>解壓縮，放置桌面</li>
            <li>打開 Terminal.app , 進去這個資料夾</li>
            <li>在 Terminal 輸入 ./register.sh </li>
          </ul>
          <p>以上完成後，請重新啟動 Allspark.</p>
        </DialogBody>
        <DialogFooter>
          <Button onClick={this.closeConnectWithComputerDialog} kind="primary">
            OK
          </Button>
        </DialogFooter>
      </Dialog>
    );

    let settingDialog = (
      <Dialog
        show={this.state.settingDialogShow}
        size="large"
        styles={{ zIndex: 999 }}
        onHide={this.closeSettingDialog}
      >
        <DialogHeader>
          <div><MiSetting style={{ marginRight: 5 }} />Setting</div>
        </DialogHeader>
        <DialogBody>
          <InputForm>
            <Select
              label="Baudrate"
              selectedValue={this.state.baudrateValue}
              onChange={(e, value) => {
                chrome.storage.sync.set({ 'baudrateValue': e.target.value });
                this.setState({ baudrateValue: e.target.value });
              }}>
              <InputRadio value="115200" label="115200" style={{ marginRight: 20 }}/>
              <InputRadio value="57600" label="57600" style={{ marginRight: 20 }}/>
              <InputRadio value="9600" label="9600" style={{ marginRight: 20 }} />
            </Select>
            <InputText
              label="Path"
              defaultValue={this.state.filePathValue}
              placeholder="Input your file path."
              onChange={(e, value) => {
                chrome.storage.sync.set({ 'filePathValue': e.target.value });
                this.setState({ filePathValue: e.target.value });
              }}
            />
            <InputSelect
              label="Serial port"
              style={{ width: 375 }}
              items={this.state.serialPorts}
              value={this.state.serialPortsValue}
              placeholder="Choose a port!"
              filterFunc={() => true}
              onChange={(e, value) => {
                chrome.storage.sync.set({ 'serialPortsValue': value });
                this.setState({ serialPortsValue: value });
              }}
            />
          </InputForm>
        </DialogBody>
        <DialogFooter>
            <Button
              onClick={this.onRefreshSerialPort}
            >
              <MiFlip size="1.5em" style={{marginRight: 5}}/>Serial port
            </Button>
          <Button onClick={this.closeSettingDialog} kind="primary">
            OK
          </Button>
        </DialogFooter>
      </Dialog>
    );

    return (
      <div style={{ width: 954, margin: '0 auto', padding: '20px 0' }}>
        {settingDialog}
        {connectWithComputerDialog}
        <h1> Allspark </h1>
        <div className={main.config}>
          <div className={main.configContent}>
            <span>serialPort: {this.state.serialPortsValue}</span>
            <span>baudrate: {this.state.baudrateValue}</span>
          </div>
          <div className={main.configBtnContent}>
          {
              this.state.connected ?
                <MiStatusWait className={main.configBtnIcon} style={{color: '#0080B4'}}/>
              :
                <MiSyncAlert onClick={this.openConnectWithComputerDialog} className={main.configBtnIcon} style={{color: 'red'}}/>
          }
          <InputGroup>
            <Button onClick={this.onDownloadFW}><MiFotaPuch style={{ marginRight: 5 }} /> Download</Button>
            <Button onClick={this.onScreenLog}><MiDiagnosis style={{ marginRight: 5 }} /> Console</Button>
            <Button onClick={this.openSettingDialog} kind="cancel"><MiSetting style={{ marginRight: 5 }} />Setting</Button>
          </InputGroup>
          </div>
        </div>
        <div>
          <CodeBlock
            style={{
              maxHeight: 510,
              height: 510,
              width: '100%',
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
        <div>
          <Progressbar now={this.state.progress} style={{ height: 5 }}/>
        </div>
        <div className={main.clearConfig}>
          <div>
            version: {Package.version}
          </div>
          <InputGroup>
            <Button onClick={this.onClearLog}>Clear</Button>
            <Button kind="cancel">Exit</Button>
          </InputGroup>
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
