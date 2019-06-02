/**
 * @package merkle-tree-binary
 * @author  Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @license 0BSD
 */
crypto	= require('crypto')
lib		= require('..')
test	= require('tape')

sha1			= (data) ->
	crypto.createHash('sha1').update(data).digest()
random_bytes	= crypto.randomBytes

test('merkle-tree-binary 1', (t) !->
	item	= random_bytes(20)
	t.same(lib.getRoot([item], sha1), item)
	t.equal(lib.getProof([item], item, sha1).length, 0)
	t.ok(lib.checkProof(item, new Uint8Array(0), item, sha1))
	t.notOk(lib.checkProof(item, new Uint8Array(1), item, sha1))
	t.end()
)

test('merkle-tree-binary 2', (t) !->
	item1	= Buffer.from('73b824aa6091c14ce5d72d17b4e84317afba4cee', 'hex')
	item2	= Buffer.from('93158d5aa8dda6d8fe8db6b3c80448312c4ed52c', 'hex')
	root	= Buffer.from('f7a66262edf364a8d23f487cb59d37446ec0fbd1', 'hex')
	proof1	= Buffer.from('0093158d5aa8dda6d8fe8db6b3c80448312c4ed52c', 'hex')
	proof2	= Buffer.from('0173b824aa6091c14ce5d72d17b4e84317afba4cee', 'hex')
	t.same(lib.getRoot([item1, item2], sha1), root)
	t.same(lib.getProof([item1, item2], item1, sha1), proof1)
	t.same(lib.getProof([item1, item2], item2, sha1), proof2)
	t.ok(lib.checkProof(root, proof1, item1, sha1))
	t.ok(lib.checkProof(root, proof2, item2, sha1))
	t.notOk(lib.checkProof(root, proof2, item1, sha1))
	t.notOk(lib.checkProof(root, proof1, item2, sha1))
	t.end()
)

test('merkle-tree-binary 3', (t) !->
	item1	= Buffer.from('8f86ba7f7481fa30716b0bc5b37650bdf4999204', 'hex')
	item2	= Buffer.from('025e1d661e91e1c55ce9091c89512d97251c7b61', 'hex')
	item3	= Buffer.from('bbed8ca2b401f13ab821d4f24f58a39bdabcd683', 'hex')
	root	= Buffer.from('9d0192f5119f2c2654d9dc73233c61c0c0a26aa3', 'hex')
	proof1	= Buffer.from('00025e1d661e91e1c55ce9091c89512d97251c7b6100c99a4bc9d9b292a428fc71759c83e967bf3559ca', 'hex')
	proof2	= Buffer.from('018f86ba7f7481fa30716b0bc5b37650bdf499920400c99a4bc9d9b292a428fc71759c83e967bf3559ca', 'hex')
	proof3	= Buffer.from('00bbed8ca2b401f13ab821d4f24f58a39bdabcd68301f0b509ed572e51c041f1f4b902b4aa55899c205d', 'hex')
	t.same(lib.getRoot([item1, item2, item3], sha1), root)
	t.same(lib.getProof([item1, item2, item3], item1, sha1), proof1)
	t.same(lib.getProof([item1, item2, item3], item2, sha1), proof2)
	t.same(lib.getProof([item1, item2, item3], item3, sha1), proof3)
	t.ok(lib.checkProof(root, proof1, item1, sha1))
	t.ok(lib.checkProof(root, proof2, item2, sha1))
	t.ok(lib.checkProof(root, proof3, item3, sha1))
	t.notOk(lib.checkProof(root, proof3, item1, sha1))
	t.notOk(lib.checkProof(root, proof2, item3, sha1))
	t.notOk(lib.checkProof(root, proof1, item2, sha1))
	t.end()
)
