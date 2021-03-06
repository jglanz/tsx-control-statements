import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { For, Choose, When, Otherwise } from '../../../src'


declare var i:number, thingy: any
export default class Example extends React.Component<{}, { things: string[] }> {
	state = { things: ['this', 'is', 'DEMOOO!'] };

	_onChange = (event:any) => this.setState({ things: event.target.value.split(' ').filter(Boolean) })

	render() {
		const { things } = this.state as any;
		return (
			<div>
				<input type="text" onChange={this._onChange} />
				<Choose>
					<When condition={things.length > 0}>
						<h1>{things.length} thingies:</h1>
						<For each="thingy" index="i" of={things}>
							<p key={i}>{i}. {thingy}</p>
						</For>
					</When>
					<Otherwise>
						no thingies :(
					</Otherwise>
				</Choose>
			</div>
		)
	}
}

ReactDOM.render(<Example />, document.getElementById('app-container'));
