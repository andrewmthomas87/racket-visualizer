import * as React from 'react'

import parse, { ParseException } from '../../parser'
import TreeNode from '../../TreeNode'

import TreeVisualizer from './TreeVisualizer'
import Exception from './Exception'

import './component.less'

interface IProps extends React.Props<void> {
	source: string
}

class Tree extends React.Component<IProps, {}> {

	public render(): JSX.Element {
		const source = this.props.source

		let content: JSX.Element
		if (source === '') {
			content = <h2>Input a Racket expression to visualize it</h2>
		}
		else {
			try {
				const tree = new TreeNode(parse(source).item)

				content = <TreeVisualizer tree={tree} />
			}
			catch (exception) {
				if (exception instanceof ParseException) {
					content = <Exception source={source} exception={exception} />
				}
				else {
					content = <h2>Unexpected error</h2>
					console.error(exception)
				}
			}
		}

		return (
			<div id='tree'>{content}</div>
		)
	}

}

export default Tree
