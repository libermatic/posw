import * as store from '../store';
import * as intercept from './intercept';
import * as assets from './assets';

if (self && self instanceof ServiceWorkerGlobalScope) {
  self.posw = Object.assign({ store, intercept, assets });
}
