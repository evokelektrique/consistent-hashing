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

   remove_node(index) {
      delete this.nodes[index];
      return this.nodes;
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

/**
 * Get element by ID
 *
 * @param  {String} id Element ID
 * @return {Object}    Element
 */
function get(id) {
   return document.getElementById(id);
}

/**
 * Generate a fake IP address
 *
 * @return {String} Fake address
 */
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

/**
 * Generate an alphabetical name
 * @return {[type]} [description]
 */
function generate_random_name() {
   const names = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
   const index = names[Math.floor(Math.random() * names.length)];

   return index;
}

/**
 * Create dom node
 *
 * @param  {Object} node Node
 * @return {Object}      Element
 */
function create_node(node) {
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

   return wrapper;
}

/**
 * Add a new node to ring
 *
 * @param {Object} node Node object
 */
function add_node(node) {
   const wrapper = create_node(node);

   get('flatten_ring').appendChild(wrapper);
}

/**
 * Remove nodes form ring
 *
 * @param  {Object} ring Ring object
 * @return {Array}       A list of new nodes
 */
function remove_node(ring) {
   const nodes = Array.from(document.querySelectorAll('#flatten_ring .node'));

   if(nodes.length === 0) {
      alert('Please add some node');
      return;
   }

   const last_node = nodes[nodes.length - 1];
   const host      = last_node.querySelector('.host').innerText;
   const new_nodes = ring.nodes.filter(node => node.host !== host);

   // Re compute nodes
   ring.nodes      = new_nodes;

   last_node.remove()

   return new_nodes;
}

/**
 * Find the destination of request
 *
 * @param  {Object} ring     Ring
 * @param  {String} message  Message
 * @return {Integer}         Server index
 */
async function send_request(ring, message) {
   const total_nodes = ring.nodes.length;
   const hash        = await Ring.hash(message);
   const index       = ring.convert_to_integer(hash) % total_nodes;
   const destination = ring.nodes[index];

   return destination;
}

function show_result(node) {
   const container = get('destination');
   const wrapper   = create_node(node);
   get('destination').classList.remove('hide');

   return wrapper;
}

function hide_result() {
   get('destination').classList.add('hide');
}

const ring = Ring;

get('add_node').addEventListener('click', e => {
   e.preventDefault();
   const node = ring.add_node(generate_random_name(), generate_random_ip());
   add_node(node);
});

get('remove_node').addEventListener('click', e => {
   e.preventDefault();
   remove_node(ring);
   hide_result();
});

get('send_request').addEventListener('click', async e => {
   e.preventDefault();

   if(ring.nodes.length === 0) {
      alert("Please add some node");
      return;
   }

   const nodes              = Array.from(document.querySelectorAll('#flatten_ring .node'));
   const request_id_element = e.target.querySelector('#request_id');
   const request_id         = parseInt(request_id_element.innerText) + 1;
   const node               = await send_request(ring, request_id);
   const container          = get('destination');
   const wrapper            = show_result(node);

   const search = nodes.filter(n => {
      const host = n.querySelector('.host').innerText;
      return host === node.host;
   })[0];

   nodes.forEach(n => {
      n.classList.remove('is-active');
   });
   console.log(search);
   search.classList.add('is-active');

   request_id_element.innerText = request_id;
   container.innerHTML          = wrapper.outerHTML;
});

