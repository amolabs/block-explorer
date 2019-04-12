import React, { Component } from 'react';
import { getBlockByHeight } from '../rpc';
import moment from 'moment';

class Block extends Component {
	state = {
		block: {
			hash: null,
			height: null,
			proposer: null,
			numTx: null,
			timestamp: null,
		},
	};
	fetchBlock = () => {
		getBlockByHeight(this.props.match.params.blockHeight, result => {
			this.setState({ block: result });
		});
	};

	componentDidMount() {
		this.fetchBlock();
	}

	render() {
		return (
			<div className="container">
				<BlockInfo name="Hash" content={this.state.block.hash} />
				<BlockInfo name="Height" content={this.state.block.height} />
				<BlockInfo name="Proposer" content={this.state.block.proposer} />
				<BlockInfo name="NumTx" content={this.state.block.numTx} />
				<BlockInfo
					name="Timestamp"
					content={moment(this.state.block.timestamp).format()}
				/>
			</div>
		);
	}
}
const BlockInfo = ({ name, content }) => {
	return (
		<p>
			{name} : {content}
		</p>
	);
};

export default Block;
