/**
 * @package merkle-tree-binary
 * @author  Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @license 0BSD
 */
import {createHash, randomBytes} from "crypto";
import * as test from "tape";
import {Tree} from "../src";

function sha1(data: Uint8Array): Uint8Array {
    return createHash('sha1').update(data).digest();
}

test('merkle-tree-binary 1', (t) => {
    const item = randomBytes(20);
    const tree = new Tree([item], sha1);
    t.same(tree.getRoot(), item);
    t.equal(tree.getProof(item).length, 0);
    t.ok(Tree.checkProof(item, new Uint8Array(0), item, sha1));
    t.notOk(Tree.checkProof(item, new Uint8Array(1), item, sha1));
    t.end();
});
test('merkle-tree-binary 2', (t) => {
    const item1 = Buffer.from('73b824aa6091c14ce5d72d17b4e84317afba4cee', 'hex');
    const item2 = Buffer.from('93158d5aa8dda6d8fe8db6b3c80448312c4ed52c', 'hex');
    const root = Buffer.from('f7a66262edf364a8d23f487cb59d37446ec0fbd1', 'hex');
    const proof1 = Buffer.from('0093158d5aa8dda6d8fe8db6b3c80448312c4ed52c', 'hex');
    const proof2 = Buffer.from('0173b824aa6091c14ce5d72d17b4e84317afba4cee', 'hex');
    const tree = new Tree([item1, item2], sha1);
    t.same(tree.getRoot().join(','), root.join(','));
    t.same(tree.getProof(item1).join(','), proof1.join(','));
    t.same(tree.getProof(item2).join(','), proof2.join(','));
    t.ok(Tree.checkProof(root, proof1, item1, sha1));
    t.ok(Tree.checkProof(root, proof2, item2, sha1));
    t.notOk(Tree.checkProof(root, proof2, item1, sha1));
    t.notOk(Tree.checkProof(root, proof1, item2, sha1));
    t.end();
});
test('merkle-tree-binary 3', (t) => {
    const item1 = Buffer.from('8f86ba7f7481fa30716b0bc5b37650bdf4999204', 'hex');
    const item2 = Buffer.from('025e1d661e91e1c55ce9091c89512d97251c7b61', 'hex');
    const item3 = Buffer.from('bbed8ca2b401f13ab821d4f24f58a39bdabcd683', 'hex');
    const root = Buffer.from('9d0192f5119f2c2654d9dc73233c61c0c0a26aa3', 'hex');
    const proof1 = Buffer.from('00025e1d661e91e1c55ce9091c89512d97251c7b6100c99a4bc9d9b292a428fc71759c83e967bf3559ca', 'hex');
    const proof2 = Buffer.from('018f86ba7f7481fa30716b0bc5b37650bdf499920400c99a4bc9d9b292a428fc71759c83e967bf3559ca', 'hex');
    const proof3 = Buffer.from('00bbed8ca2b401f13ab821d4f24f58a39bdabcd68301f0b509ed572e51c041f1f4b902b4aa55899c205d', 'hex');
    const tree = new Tree([item1, item2, item3], sha1);
    t.same(tree.getRoot(), root);
    t.same(tree.getProof(item1).join(','), proof1.join(','));
    t.same(tree.getProof(item2).join(','), proof2.join(','));
    t.same(tree.getProof(item3).join(','), proof3.join(','));
    t.ok(Tree.checkProof(root, proof1, item1, sha1));
    t.ok(Tree.checkProof(root, proof2, item2, sha1));
    t.ok(Tree.checkProof(root, proof3, item3, sha1));
    t.notOk(Tree.checkProof(root, proof3, item1, sha1));
    t.notOk(Tree.checkProof(root, proof2, item3, sha1));
    t.notOk(Tree.checkProof(root, proof1, item2, sha1));
    t.end();
});
test('merkle-tree-binary 4', (t) => {
    const items = [];
    for (let i = 0; i < 1000; ++i) {
        items.push(randomBytes(20));
    }
    const tree = new Tree(items, sha1);
    for (const item of items) {
        t.ok(
            Tree.checkProof(
                tree.getRoot(),
                tree.getProof(item),
                item,
                sha1,
            ),
        );
    }
    t.end();
});
