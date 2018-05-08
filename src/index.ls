/**
 * @package merkle-tree-binary
 * @author  Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @license 0BSD
 */
/**
 * @param {!Uint8Array} array1
 * @param {!Uint8Array} array2
 *
 * @return {!Uint8Array}
 */
function concat (array1, array2)
	length	= array1.length
	new Uint8Array(length * 2)
		..set(array1)
		..set(array2, length)
/**
 * @param {!Uint8Array}	array1
 * @param {!Uint8Array}	array2
 *
 * @return {boolean}
 */
function are_arrays_equal (array1, array2)
	if array1 == array2
		return true
	if array1.length != array2.length
		return false
	for item, key in array1
		if item != array2[key]
			return false
	true
/**
 * @param {!Array<!Uint8Array>}	items
 * @param {!Function}			hash_function
 */
function get_root (items, hash_function)
	if items.length == 1
		items[0]
	else
		item_length	= items[0].length
		new_items	=
			for item1, index in items by 2
				item2	= items[index + 1] || item1
				hash_function(concat(item1, item2))
		get_root(new_items, hash_function)
/**
 * @param {!Array<!Uint8Array>}	items
 * @param {!Uint8Array}			target_item
 * @param {!Function}			hash_function
 * @param {!Array<number>}		proof
 *
 * @return {!Uint8Array}
 */
function get_proof (items, target_item, hash_function, proof = [])
	if items.length == 1
		return Uint8Array.from(proof)
	tree	= []
	for item1, index in items by 2
		item2	= items[index + 1] || item1
		hash	= hash_function(concat(item1, item2))
		tree.push(hash)
		if are_arrays_equal(item1, target_item)
			proof.concat(0, Array.from(item2))
			target_item	= hash
		else if are_arrays_equal(item2, target_item)
			proof.concat(1, Array.from(item1))
			target_item	= hash

	get_proof(tree, target_item, hash_function, proof)
/**
 * @param {!Uint8Array}	root
 * @param {!Uint8Array}	proof
 * @param {!Uint8Array}	target_item
 * @param {!Function}	hash_function
 *
 * @return {boolean}
 */
function check_proof (root, proof, target_item, hash_function)
	if are_arrays_equal(root, target_item) && proof.length == 0
		return true
	item_length	= target_item.length
	if proof.length % (item_length + 1)
		return false
	proof_step	= item_length + 1
	for i from 0 til proof.length by proof_step
		item	= proof.subarray(i + 1, i + proof_step)
		if proof[i]
			target_item	= hash_function(concat(item, target_item))
		else
			target_item	= hash_function(concat(target_item, item))
	are_arrays_equal(root, target_item)

function Wrapper
	{
		'get_root'		: get_root
		'get_proof'		: get_proof
		'check_proof'	: check_proof
	}

if typeof define == 'function' && define['amd']
	# AMD
	define(Wrapper)
else if typeof exports == 'object'
	# CommonJS
	module.exports = Wrapper()
else
	# Browser globals
	@'merkle_tree_binary' = Wrapper()
