import * as React from 'react'

import './component.less'

interface IProps extends React.Props<void> {
	debounceTimeMs: number
	onChange(value: string): void
}

interface IState {
	value: string
}

class Input extends React.Component<IProps, IState> {

	public state: IState = { value: '' }

	private _timeout: any

	public render(): JSX.Element {
		const value = this.state.value

		return (
			<input id='input' type='text' value={value} placeholder='Racket expression' onChange={this._onChange} onKeyDown={this._onKeyDown} />
		)
	}

	private _onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		clearTimeout(this._timeout)
		this._timeout = setTimeout(this._onBroadcast, this.props.debounceTimeMs)

		this.setState({ value: event.target.value })
	}

	private _onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.metaKey && event.keyCode === 220) {
			clearTimeout(this._timeout)
			this._timeout = setTimeout(this._onBroadcast, this.props.debounceTimeMs)

			this.setState({ value: event.currentTarget.value + '\u03BB' })
		}
	}

	private _onBroadcast = () => {
		this.props.onChange(this.state.value.trim())
	}

}

export default Input
