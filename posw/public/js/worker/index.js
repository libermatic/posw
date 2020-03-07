import * as store from '../store';
import * as intercept from './intercept';

if (self && self instanceof ServiceWorkerGlobalScope) {
  self.posw = Object.assign({ store, intercept });
}
