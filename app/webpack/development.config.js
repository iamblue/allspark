import path from 'path';
import baseConfig from './base.config';

export default {
  ...baseConfig,
  devtool: 'eval',
  devServer: {
    port: process.env.PORT || 8081,
    host: '127.0.0.1',
    contentBase: path.resolve(__dirname, '../build'),
    publicPath: '/assets/',
    hot: true,
    stats: { colors: true },
  },
};
