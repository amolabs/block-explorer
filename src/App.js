import React, { Component } from 'react';
import NavBar from './components/NavBar';
import { BlocksPreview, TxPreview } from './components/Previews';

class App extends Component {
	state = {
		blocks: [
			{
				height: 1,
				hash: '0e134121235',
				miner: '0xd2123422',
				transaction: 10,
				timestamp: 'time',
			},
			{
				height: 2,
				hash: '0e134121235',
				miner: '0xd2123422',
				transaction: 10,
				timestamp: 'time',
			},
			{
				height: 3,
				hash: '0e134121235',
				miner: '0xd2123422',
				transaction: 10,
				timestamp: 'time',
			},
		],
		txs: [
			{
				hash: '0x12a23',
				from: '0x0d2212341234',
				to: '0x0d2213241234',
				amount: 0.1,
				timestamp: 'time',
			},
			{
				hash: '0x12a23',
				from: '0x0d2212341234',
				to: '0x0d2213241234',
				amount: 0.2,
				timestamp: 'time',
			},
			{
				hash: '0x12a23',
				from: '0x0d2212341234',
				to: '0x0d2213241234',
				amount: 0.3,
				timestamp: 'time',
			},
		],
	};

	render() {
		return (
			<div className="App">
				<NavBar />
				<div className="container-fluid">
					<div className="row">
						<div className="col-md-6">
							<BlocksPreview blocks={this.state.blocks} />
						</div>
						<div className="col-md-6">
							<TxPreview txs={this.state.txs} />
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default App;
