// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { TextInput, KeyValueRow, accountLink, txLink } from '../util';
import { fetchBlock } from '../rpc';

class Block extends Component {
	state = {
		heightInput: this.props.match.params.height,
		heightActive: this.props.match.params.height,
	};

	componentDidUpdate(prevProps) {
		if (this.props.match.params.height !== prevProps.match.params.height) {
			const height = this.props.match.params.height;
			this.setState({ heightInput: height, heightActive: height });
		}
	}

	handleChange = (e) => {
		this.setState({ heightInput: e.target.value });
	}

	handleSubmit = (e) => {
		e.preventDefault();
		if (this.state.heightInput) {
			this.setState({ heightActive: this.state.heightInput });
			this.props.history.push('/block/'+this.state.heightInput);
		}
	}

	render() {
		return (
			<div className="container">
				<TextInput desc="Height" name="height"
					value={this.state.heightInput}
					onChange={this.handleChange}
					onSubmit={this.handleSubmit}/>
				<BlockDetail height={this.state.heightActive}/>
			</div>
		);
	}
}

class BlockDetail extends Component {
	state = {
		block: {
			height: null,
			chain: null,
			hash: null,
			proposer: null,
			numTx: null,
			time: null,
			txs: null,
		}
	};

	componentDidMount() {
		this.updateBlock();
	}

	componentDidUpdate(prevProps) {
		if (this.props.height !== prevProps.height) {
			this.updateBlock();
		}
	}

	updateBlock = () => {
		if (this.props.height) {
			fetchBlock(this.props.height,
				result => {
					this.setState({ block: result });
				}
			);
		}
	};

	render() {
		var heightAlt = this.props.height;
		if (!heightAlt) {
			heightAlt = ( <span>Input block height to inspect &uarr;</span> );
		}
		// TODO: use validatorLink
		const proposer = accountLink(this.state.block.proposer);
		return (
			<div className="container">
				<KeyValueRow k="Height" v={heightAlt} />
				<KeyValueRow k="Chain-ID" v={this.state.block.chain}/>
				<KeyValueRow k="Proposer" v={proposer}/>
				<KeyValueRow k="Time" v={this.state.block.timestamp}/>
				<KeyValueRow k="NumTx" v={this.state.block.numTx}/>
				<TxBriefList txs={this.state.block.txs}/>
			</div>
		);
	}
}

const TxBriefList = ({txs}) => {
	if (!txs) txs = [];
	return (
		<ul>
			{ txs.map((tx) => {
				return (<TxBriefItem key={tx.hash} tx={tx}/>);
			}) }
		</ul>
	);
};

const TxBriefItem = ({tx}) => {
	return (
		<li key={tx.hash}>TxHash: {txLink(tx.hash)}<br/>
			Sender: {accountLink(tx.sender)}, Type: {tx.type}</li>
	);
};

export default withRouter(Block);
