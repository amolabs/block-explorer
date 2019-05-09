// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { TxBody } from '../components/Tx';
import { TextInput, KeyValueRow, accountLink, blockLink } from '../util';
import { fetchTx } from '../rpc';

class Tx extends Component {
	state = {
		txHash: this.props.match.params.txHash,
	};

	componentDidUpdate(prevProps) {
		if (this.props.match.params.txHash !== prevProps.match.params.txHash) {
			const txHash = this.props.match.params.txHash;
			this.setState({ txHash: txHash });
		}
	}

	updateTxHash = (txHash) => {
		this.setState({ txHash: txHash });
		this.props.history.push('/tx/'+txHash);
	}

	render() {
		return (
			<div className="container">
				<TextInput desc="TxHash" name="txHash"
					value={this.state.txHash}
					button="Query"
					onSubmit={this.updateTxHash}/>
				<TxDetail txHash={this.state.txHash}/>
			</div>
		);
	}
}

class TxDetail extends Component {
	state = {
		tx: {
			txHash: "loading...",
			index: "loading...",
			height: "loading...",
			sender: "loading...",
			type: "loading...",
			nonce: "loading...",
		}
	};

	componentDidMount() {
		this.updateTx();
	}

	componentDidUpdate(prevProps) {
		if (this.props.txHash !== prevProps.txHash) {
			this.updateTx();
		}
	}

	updateTx = () => {
		if (this.props.txHash) {
			fetchTx(this.props.txHash,
				result => {
					this.setState({ tx: result });
				}
			);
		} else {
			this.setState({ tx: {} });
		}
	};

	render() {
		var txHashAlt = this.props.txHash;
		if (!txHashAlt) {
			txHashAlt = ( <span>Input transaction hash to inspect &uarr;</span> );
		}
		const sender = accountLink(this.state.tx.sender);
		const position = (
			<span> index {this.state.tx.index} in
				a block at height {blockLink(this.state.tx.height)}
			</span>
		);
		return (
			<div className="container">
				<KeyValueRow k="TxHash" v={txHashAlt} />
				<KeyValueRow k="Position" v={position} />
				<KeyValueRow k="Sender" v={sender} />
				<KeyValueRow k="Nonce" v={this.state.tx.nonce} />
				<KeyValueRow k="Type" v={this.state.tx.type} />
				<TxBody tx={this.state.tx} />
			</div>
		);
	}
}

export default withRouter(Tx);
