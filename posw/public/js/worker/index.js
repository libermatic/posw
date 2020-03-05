import db from '../store';
import * as utils from './utils';

if (self && self instanceof ServiceWorkerGlobalScope) {
  const posw = { db, utils };
  self.posw = posw;
}
