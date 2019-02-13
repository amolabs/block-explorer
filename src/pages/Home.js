import React, { Component } from 'react';
import BlocksPreview from '../components/BlocksPreview';
import TxsPreview from '../components/TxsPreview';
import { getBlocks } from '../rpc';

class Home extends Component {
	state = {
		blocks: [],
		txs: [],
	};

	fetchBlocks = () => {
		getBlocks(this.props.latestHeight, 10, res => {
			this.setState({ blocks: res });
		});
	};

	componentDidMount() {
		// fetch blocks on component mount (for router)
		if (this.props.latestHeight != null) this.fetchBlocks();
	}

	componentDidUpdate(prevProps) {
		// fetch blocks if latest height changed
		if (this.props.latestHeight !== prevProps.latestHeight) {
			this.fetchBlocks();
		}
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
