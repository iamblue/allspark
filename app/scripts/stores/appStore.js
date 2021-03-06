import AppDispatcher from '../dispatcher/appDispatcher';
import assign from 'object-assign';
import AppConstants from '../constants/appConstants';
import AppActions from '../actions/appActions';

const EventEmitter = require('events').EventEmitter;
const CHANGE_EVENT = 'change';

const APP_PAGE = {};

const appStore = assign({}, EventEmitter.prototype, {

  init: () => {
    return APP_PAGE;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

});

AppDispatcher.register((action) => {
  console.log(action)
  if (action.log) {
    APP_PAGE.log = action.log;
    appStore.emitChange();
  } else if (action.connected) {
    APP_PAGE.connected = action.connected;
    appStore.emitChange();
  } else if (action.progress) {
    APP_PAGE.progress = action.progress;
    appStore.emitChange();
  }
});

module.exports = appStore;