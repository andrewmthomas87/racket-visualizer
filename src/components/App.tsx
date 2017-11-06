import * as React from 'react'

import Input from './Input'
import Tree from './Tree'

interface IState {
	value: string
}

interface IProps extends React.Props<void> { }

class App extends React.Component<IProps, IState> {

	public state: IState = { value: '' }

	public render(): JSX.Element {
		return (
			<section id='app'>
				<Input debounceTimeMs={250} onChange={this._onChange} />
				<Tree source={this.state.value} />
			</section>
		)
	}

	private _onChange = (value: string) => {
		this.setState({ value })
	}

}

export default App
