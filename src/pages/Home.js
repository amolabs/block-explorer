import React, { Component } from 'react';
import BlocksPreview from '../components/BlocksPreview';
import TxsPreview from '../components/TxsPreview';

class Home extends Component {
	state = {
		blocks: [
			{
				height: 1,
				hash: '0e1341212351',
				miner: '0xd2123422',
				transaction: 10,
				timestamp: 'time',
			},
			{
				height: 2,
				hash: '0e1341212352',
				miner: '0xd2123422',
				transaction: 10,
				timestamp: 'time',
			},
			{
				height: 3,
				hash: '0e1341212353',
				miner: '0xd2123422',
				transaction: 10,
				timestamp: 'time',
			},
		],
		txs: [
			{
				hash: '0x12a231',
				from: '0x0d2212341234',
				to: '0x0d2213241234',
				amount: 0.1,
				timestamp: 'time',
			},
			{
				hash: '0x12a232',
				from: '0x0d2212341234',
				to: '0x0d2213241234',
				amount: 0.2,
				timestamp: 'time',
			},
			{
				hash: '0x12a233',
				from: '0x0d2212341234',
				to: '0x0d2213241234',
				amount: 0.3,
				timestamp: 'time',
			},
		],
	};

	componentDidMount() {}

	render() {
		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-6">
						<BlocksPreview blocks={this.state.blocks} />
					</div>
					<div className="col-md-6">
						<TxsPreview txs={this.state.txs} />
					</div>
				</div>
			</div>
		);
	}
}

export default Home;
