import * as React from 'react'

import { Item, ItemType } from '../../parser'
import TreeNode from '../../TreeNode'

const NODE_HEIGHT = 3
const NODE_MARGIN = 1
const NODE_TOTAL_HEIGHT = NODE_HEIGHT + NODE_MARGIN
const LINE_SIZE = 0.25

interface IProps extends React.Props<void> {
	tree: TreeNode
}

const TreeVisualizer: React.StatelessComponent<IProps> = (props: IProps): JSX.Element => {
	const nodeList: Array<Array<TreeNode>> = TreeNode.toList(props.tree)
	const columns: Array<JSX.Element> = []
	for (let i = nodeList.length - 1; i >= 0; i--) {
		const column: Array<JSX.Element> = []

		let offset = 0
		for (let node of nodeList[i]) {
			if (node.offset - offset > 0) {
				column.push(<div key={`${node.offset}-${node.depth}-spacer`} className='spacer' style={{ height: `${NODE_TOTAL_HEIGHT * (node.offset - offset)}em` }} />)
				offset = node.offset
			}

			if (node.children.length) {
				const width = node.width - node.children[node.children.length - 1].width + 1
				column.push(<div key={`${node.offset}-${node.depth}-line`} className='line' style={{ height: `${NODE_TOTAL_HEIGHT * (width - 1) + LINE_SIZE}em` }} />)
			}
			column.push(
				<div key={`${node.offset}-${node.depth}`} className={`node ${node.depth !== 0 ? 'child' : 'root'} ${getClassNameForItem(node.item)}`}>
					{getContentForItem(node.item)}
				</div>
			)

			offset++
		}

		columns.push(<div key={i}>{column}</div>)
	}

	return <div className='tree'>{columns}</div>
}

function getClassNameForItem(item: Item): string {
	switch (item.type) {
		case ItemType.PROCEDURE:
			return 'procedure'
		case ItemType.LAMBDA:
			return 'lambda'
		case ItemType.IDENTIFIER:
			return 'identifier'
		case ItemType.STRING_LITERAL:
			return 'string-literal'
		case ItemType.NUMERIC_LITERAL:
			return 'numeric-literal'
		case ItemType.BOOLEAN_LITERAL:
			return 'boolean-literal'
		default:
			return ''
	}
}

function getContentForItem(item: Item): JSX.Element {
	switch (item.type) {
		case ItemType.PROCEDURE:
			return <div><span>{'\u25B6'}</span> {item.name}</div>
		case ItemType.LAMBDA:
			return <div><span>{'\u03BB'}</span> procedure</div>
		case ItemType.IDENTIFIER:
			return <div><span>@</span> {item.name}</div>
		case ItemType.STRING_LITERAL:
			return <div><span>"</span> {item.value}</div>
		case ItemType.NUMERIC_LITERAL:
			return <div><span>#</span> {item.value}</div>
		case ItemType.BOOLEAN_LITERAL:
			return <div><span>?</span> {item.value ? 'true' : 'false'}</div>
		default:
			return <div />
	}
}

export default TreeVisualizer
