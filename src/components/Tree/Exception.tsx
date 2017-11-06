import * as React from 'react'

import { ParseException } from '../../parser'

interface IProps extends React.Props<void> {
	source: string
	exception: ParseException
}

class Error extends React.Component<IProps, {}> {

	public render(): JSX.Element {
		const source = this.props.source
		const { index, message } = this.props.exception

		return (
			<div className='error'>
				<pre>{source.substring(0, index)}<span>{source.substr(index, 1)}</span>{source.substr(index + 1)}</pre>
				<span>{message}</span>
			</div>
		)
	}

}

export default Error
