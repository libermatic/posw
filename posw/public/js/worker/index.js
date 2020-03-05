import db from '../store';
import * as utils from './utils';

if (self && self instanceof ServiceWorkerGlobalScope) {
  self.posw = Object.assign({ db }, utils);
}
