import { default as React } from 'react';
import styles from './main.css';

import DisplayIntegerCard from 'mcs-displaycard-integer';
import DisplayIntegerCode from '../code/DisplayIntegerCode';

import CodeBlock from './codeblock';

export default class Main extends React.Component {
  render() {
    return (
      <div className={styles.base}>
        <div className={styles.block}>
          <DisplayIntegerCard
            server="ws://127.0.0.1:8000/object/123123123/viewer"
            deviceId="12312313"
            name="yyyyy"
            dataChnId="testttt"
            description="Taiwan no.1!!!"
            recordedAt={1454395072337}
            numberOfCards={3}
            configs={{ card: 1 }}
          />
          <CodeBlock title="Display-integer code" defaultValue={DisplayIntegerCode} />
        </div>
      </div>
    );
  }
}
