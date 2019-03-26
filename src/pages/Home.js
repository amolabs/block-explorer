import React, { Component } from 'react';
import BlocksPreview from '../components/BlocksPreview';
import TxsPreview from '../components/TxsPreview';
import { getRecentBlocks, getRecentTxs, startSubscribe } from '../rpc';

class Home extends Component {
	state = {
		blocks: [],
		txs: [],
	};

	fetchBlock = () => {
		getRecentBlocks(result => {
			this.setState({ blocks: result.slice(0, 10) });
		});
	};

	fetchTx = () => {
		getRecentTxs(result => {
			this.setState({ txs: result });
		});
	};

	onNewBlock = () => {
		this.fetchBlock();
		this.fetchTx();
	};
	onWsError = e => {
		console.error('web socket error: ', e);
		alert('Please check if Tendermint is running and then refresh.');
	};

	componentDidMount() {
		this.fetchBlock();
		this.fetchTx();
		startSubscribe(this.onNewBlock, this.onWsError);
	}

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
