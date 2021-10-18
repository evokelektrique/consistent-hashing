/**
 * Base consistent hashing ring object
 *
 * @type {Object}
 */
const Ring = {

   /**
    * Total servers
    *
    * @type {Array}
    */
   servers: [],

   /**
    * Add a server to ring servers list
    *
    * @param {String}  name Host name
    * @param {String}  host Host ip address
    */
   add_server(name, host) {
      this.servers.push({
         name: name,
         host: host
      });
   },

   /**
    * Hash a given message
    *
    * @param  {String} message
    * @param  {String} algorithm Cryptographic hash function
    * @return {String}           Hashed message
    */
   async hash(message, algorithm = 'SHA-256') {
      // Encode as utf-8
      const uint8 = new TextEncoder().encode(message);

      // Hash the message
      const hash_buffer = await crypto.subtle.digest(algorithm, uint8);

      // Convert buffer to byte array
      const hash_array = Array.from(new Uint8Array(hash_buffer));

      // Convert bytes to hex string
      const hashHex = hash_array.map(b => b.toString(16).padStart(2, '0')).join('');

      return hashHex;
   },

   /**
    * Convert a given hash into a radix base number
    *
    * @param  {String} hash Cryptographic hash
    * @param  {Number} base Radix, number of unique digits
    * @return {Integer}     Converted hash into integer
    */
   convert_to_integer(hash, base = 16) {
      const parsed = parseInt(hash, base)

      if(isNaN(parsed)) {
         return 0;
      }

      return parsed;
   }

};

(async () => {

   const ring = Ring;

   ring.add_server('A', '0.0.0.0');
   ring.add_server('B', '0.0.0.1');
   ring.add_server('C', '0.0.0.2');

   const total_servers = ring.servers.length;

   const message = "Test";
   const hash    = await Ring.hash(message);
   const index   = ring.convert_to_integer(hash) % total_servers;

   const destination = ring.servers[index];
   console.log(destination);

})();
