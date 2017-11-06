import { ItemType, Item } from './parser'

class TreeNode {

	public item: Item
	public parent: TreeNode | null
	public children: Array<TreeNode>
	public width: number
	public offset: number
	public depth: number

	public constructor(item: Item, parent: TreeNode | null = null, depth: number = 0) {
		this.item = item
		this.parent = parent
		this.depth = depth

		switch (item.type) {
			case ItemType.PROCEDURE:
				if (item.args.length) {
					this.children = item.args.map(arg => new TreeNode(arg, this, depth + 1))
					this.width = this.children.reduce<number>((previous: number, node: TreeNode) => previous + node.width, 0)

					if (depth === 0) {
						this.updateOffset(0)
					}
				}
				else {
					this.children = []
					this.width = 1
				}
				break
			case ItemType.LAMBDA:
				const argNodes: Array<TreeNode> = item.args.map(arg => new TreeNode(arg, this, depth + 1))
				const bodyNode: TreeNode = new TreeNode(item.body, this, depth + 1)

				this.children = argNodes.concat(bodyNode)
				this.width = item.args.length + bodyNode.width

				if (depth === 0) {
					this.updateOffset(0)
				}
				break
			default:
				this.children = []
				this.width = 1
		}
	}

	public updateOffset(offset: number) {
		let childOffset = offset
		for (let child of this.children) {
			child.updateOffset(childOffset)
			childOffset += child.width
		}

		this.offset = offset
	}

	public static toList(node: TreeNode): Array<Array<TreeNode>> {
		const list: Array<Array<TreeNode>> = []
		TreeNode._addToList(node, list)

		return list
	}

	private static _addToList(node: TreeNode, list: Array<Array<TreeNode>>) {
		if (list[node.depth]) {
			list[node.depth].push(node)
		}
		else {
			list[node.depth] = [node]
		}

		for (let child of node.children) {
			TreeNode._addToList(child, list)
		}
	}

}

export default TreeNode
