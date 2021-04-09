# kademlia-dht

**kademlia-dht** is a javascript, network-agnostic implementation of the
[Distributed Hash Table](http://en.wikipedia.org/wiki/Distributed_hash_table)
storage container abstraction, employing the
[Kademlia](http://en.wikipedia.org/wiki/Kademlia) algorithms and data
structures.

From a local point of view, a DHT is similar to a classic hash table. It
provides two main operations, `set` and `get` allowing you, respectively,
to store a key/value pair, and to retrieve a value from the key. The
"distributed" aspect comes from the fact the pairs are stored accross a
network of interconnected nodes (eg. over the Internet), making it suitable
to provide information to a large number of users. Typical usage of DHTs
include file-sharing (eg. Bitorrent).

**kademlia-dht** is implemented with Node.js, but does not depend on system
resources, like the network. Instead, the implementation of the network layer
(called by Kademlia the *Remote Procedure Calls*) is left to the user or
higher-level libraries. That means this DHT implementation is theorically
adaptable to the browser JS without too much hassle.

**Note:** this implementation is, for now partially complete. It basically
lacks two things:

   * the handling of time-driven behaviors: key/value pairs expiration,
     bucket refresh, replication, and pairs republish.
   * an implementation of the Rpc usable out-of-the-box (it will be done as a
     separate library) even though it's possible to use your own already;