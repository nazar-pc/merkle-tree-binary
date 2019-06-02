/**
 * @package merkle-tree-binary
 * @author  Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @license 0BSD
 */
type IHashFunction = (input: Uint8Array) => Uint8Array;

function concat(array1: Uint8Array, array2: Uint8Array): Uint8Array {
    const length = array1.length;
    const result = new Uint8Array(length * 2);
    result.set(array1);
    result.set(array2, length);
    return result;
}

function areArraysEqual(array1: Uint8Array, array2: Uint8Array): boolean {
    if (array1 === array2) {
        return true;
    }
    if (array1.length !== array2.length) {
        return false;
    }
    const length = array1.length;
    for (let index = 0; index < length; ++index) {
        if (array1[index] !== array2[index]) {
            return false;
        }
    }
    return true;
}

function getRoot(items: Uint8Array[], hashFunction: IHashFunction): Uint8Array {
    if (items.length === 1) {
        return items[0];
    }
    const newItems: Uint8Array[] = [];
    const length = items.length;
    for (let index = 0; index < length; index += 2) {
        const item1 = items[index];
        const item2 = items[index + 1] || item1;
        newItems.push(hashFunction(concat(item1, item2)));
    }
    return getRoot(newItems, hashFunction);
}

function getProof(items: Uint8Array[], targetItem: Uint8Array, hashFunction: IHashFunction): Uint8Array {
    return getProofInternal(items, targetItem, hashFunction);
}

function getProofInternal(items: Uint8Array[], targetItem: Uint8Array, hashFunction: IHashFunction, proof: number[] = []): Uint8Array {
    if (items.length === 1) {
        return Uint8Array.from(proof);
    }
    const tree = [];
    const length = items.length;
    for (let index = 0; index < length; index += 2) {
        const item1 = items[index];
        const item2 = items[index + 1] || item1;
        const hash = hashFunction(concat(item1, item2));
        tree.push(hash);
        if (areArraysEqual(item1, targetItem)) {
            proof = proof.concat(0, Array.from(item2));
            targetItem = hash;
        } else if (areArraysEqual(item2, targetItem)) {
            proof = proof.concat(1, Array.from(item1));
            targetItem = hash;
        }
    }
    return getProofInternal(tree, targetItem, hashFunction, proof);
}

function checkProof(root: Uint8Array, proof: Uint8Array, targetItem: Uint8Array, hashFunction: IHashFunction): boolean {
    if (areArraysEqual(root, targetItem) && proof.length === 0) {
        return true;
    }
    const itemLength = targetItem.length;
    if (proof.length % (itemLength + 1)) {
        return false;
    }
    const proofStep = itemLength + 1;
    const length = proof.length;
    for (let i = 0; i < length; i += proofStep) {
        const item = proof.subarray(i + 1, i + proofStep);
        targetItem = hashFunction(
            proof[i] ? concat(item, targetItem) : concat(targetItem, item),
        );
    }
    return areArraysEqual(root, targetItem);
}

export {getRoot, getProof, checkProof};
