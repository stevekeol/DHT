'use strict';

var Dht = require('../lib/dht.js');
var MockRpc = require('../lib/mock-rpc.js');

var SOURCE_ENDPOINT = 'localhost:9876';
var TARGET_ENDPOINT = 'localhost:4321';

function spawnNodeFromRpc(rpc, seed, cb) {
    Dht.spawn(rpc, seed, function (err, dht) {
        return cb(err, dht);
    });
}

// Spawn a node. A node is composed of two elements: the local Dht and the Rpc.
//
function spawnNode(endpoint, seed, cb) {
    MockRpc.spawn(endpoint, function (err, rpc) {
        if (err) return cb(err);
        return spawnNodeFromRpc(rpc, seed, cb);
    });
}

var nextGlobalEpIndex = 1000;

function spawnSomeNodesRecur(arr, seeds, nb, cb) {
    if (nb === 0) {
        return process.nextTick(function () {
            return cb(null, arr);
        });
    }
    spawnNode('localhost:' + nextGlobalEpIndex, seeds, function (err, dht) {
        ++nextGlobalEpIndex;
        if (err) return cb(err);
        arr.push(dht);
        if (seeds.length < 3)
            seeds.push(dht.rpc.endpoint);
        return spawnSomeNodesRecur(arr, seeds, nb - 1, cb);
    });
}

// Spawn `count` nodes with unique endpoints.
//
function spawnSomeNodes(nb, cb) {
    spawnSomeNodesRecur([], [], nb, cb);
}

describe('Dht', function () {
    describe('constructor', function () {
        it('should refuse bad RPC objects', function () {
            (function throwing() {
                new Dht({ping: function () {}});
            }).should.throw(Error);
        });
    });

    describe('#set()', function () {
        it('should store locally without error', function (cb) {
            spawnNode('localhost', [], function (err, dht) {
                should.not.exist(err);
                dht.set('foo', 12, function (err) {
                    should.not.exist(err);
                    //dht.peek('foo').should.equal(12);
                    cb();
                });
            });
        });
    });

    it('should store and get with a lot of nodes', function (cb) {
        var count = 50;
        spawnSomeNodes(count, function (err, dhts) {
            should.not.exist(err);
            dhts.should.have.length(count);
            var dht = dhts[0];
            dht.set('foo', 42, function (err) {
                should.not.exist(err);
                //dht.peek('foo').should.equal(42);
                for (var i = 0; i < dhts.length; ++i) {
                    if (!dhts[i].peek('foo')) break;
                }
                i.should.not.equal(dhts.length);
                dhts[i].get('foo', function (err, value) {
                    value.should.equal(42);
                    cb();
                });
            });
        });
    });
});
