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

export class Tree {
    public static checkProof(root: Uint8Array, proof: Uint8Array, targetItem: Uint8Array, hashFunction: IHashFunction): boolean {
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

    private readonly tree: Uint8Array[][] = [];
    private readonly items: Uint8Array[];

    constructor(
        items: Uint8Array[],
        hashFunction: IHashFunction,
    ) {
        this.items = items;
        this.buildTree(items, hashFunction);
    }

    public getProof(targetItem: Uint8Array): Uint8Array {
        const items = this.items;
        const length = items.length;
        for (let i = 0; i < length; ++i) {
            if (areArraysEqual(items[i], targetItem)) {
                return this.getProofFor(i);
            }
        }

        throw new Error('Item not found');
    }

    public getRoot(): Uint8Array {
        return this.tree[this.tree.length - 1][0];
    }

    private buildTree(items: Uint8Array[], hashFunction: IHashFunction): void {
        this.tree.push(items);
        if (items.length === 1) {
            return;
        }
        const newItems: Uint8Array[] = [];
        const length = items.length;
        for (let index = 0; index < length; index += 2) {
            const item1 = items[index];
            const item2 = items[index + 1] || item1;
            newItems.push(hashFunction(concat(item1, item2)));
        }

        this.buildTree(newItems, hashFunction);
    }

    private getProofFor(itemIndex: number): Uint8Array {
        const proof: number[] = [];
        const tree = this.tree;
        const levels = tree.length - 1;

        let currentLevel = 0;
        let right = itemIndex % 2;
        let index = itemIndex - right;

        // Last level is the root itself, hence we exclude it
        while (currentLevel < levels) {
            const treeLevel = tree[currentLevel];
            // if current element is to the right - take left element, otherwise try to take right one and fallback to left if not present (unbalanced tree)
            const otherItem = right
                ? treeLevel[index]
                : (treeLevel[index + 1] || treeLevel[index]);
            proof.push(right, ...otherItem);
            right = (index / 2) % 2;
            index = index / 2 - right;
            ++currentLevel;
        }

        return Uint8Array.from(proof);
    }
}
