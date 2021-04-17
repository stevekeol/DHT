import Dht from '../src/dht';
import MockRpc from '../src/mockRpc';

/**
 * Store a value on one side and get it back on the other side.
 * @param {any} dht1 [description]
 * @param {any} dht2 [description]
 */
function demo(dht1: any, dht2: any): void {
  dht1.set('beep', 'boop', function (err) {
    if (err) throw err;
    dht2.get('beep', function (err, value) {
      if (err) throw err;
      console.log('%s === %s', 'boop', value);
    });
  });
}




