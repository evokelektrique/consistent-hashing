/**
 * Base consistent hashing ring object
 *
 * @type {Object}
 */
const Ring = {

   /**
    * Total nodes
    *
    * @type {Array}
    */
   nodes: [],

   /**
    * Add a node to ring nodes list
    *
    * @param {String}  name Host name
    * @param {String}  host Host ip address
    */
   add_node(name, host) {
      const node = {
         name: name,
         host: host
      };

      this.nodes.push(node);

      return node;
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

// (async () => {

//    const ring = Ring;

//    ring.add_node('A', '0.0.0.0');
//    ring.add_node('B', '0.0.0.1');
//    ring.add_node('C', '0.0.0.2');

//    const total_nodes = ring.nodes.length;

//    const message = "Test";
//    const hash    = await Ring.hash(message);
//    const index   = ring.convert_to_integer(hash) % total_nodes;

//    const destination = ring.nodes[index];
//    console.log(destination);

// })();


function get(id) {
   return document.getElementById(id);
}

function generate_random_ip() {
   let ip = "";
   let i = 0;
   while(i < 4) {
      ip += Math.floor(Math.random() * 255);
      if(i > 2) {
         break;
      } else {
         ip += "."
      }
      i += 1
   }

   return ip;
}

function generate_random_name() {
   const names = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
   const index = names[Math.floor(Math.random() * names.length)];

   return index;
}

const ring = Ring;

get('add_node').addEventListener('click', e => {
   e.preventDefault();
   const node = ring.add_node(generate_random_name(), generate_random_ip());
   console.log(ring)
   add_node(node);
});


function add_node(node) {
   const wrapper   = document.createElement('div');
   const node_name = document.createElement('span');
   const node_host = document.createElement('span');

   wrapper.classList.add('node');
   node_name.classList.add('name');
   node_host.classList.add('host');

   node_name.innerText = node.name;
   node_host.innerText = node.host;

   wrapper.appendChild(node_name);
   wrapper.appendChild(node_host);

   get('flatten_ring').appendChild(wrapper);
}
