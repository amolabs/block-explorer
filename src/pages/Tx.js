// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { fetchTx } from '../rpc';

class Tx extends Component {
	state = {
		txHashInput: this.props.match.params.txHash,
		txHashActive: this.props.match.params.txHash,
	};

	componentDidUpdate(prevProps) {
		if (this.props.match.params.txHash !== prevProps.match.params.txHash) {
			const txHash = this.props.match.params.txHash;
			this.setState({ txHashInput: txHash, txHashActive: txHash });
		}
	}

	handleChange = (e) => {
		this.setState({ txHashInput: e.target.value });
	}

	handleSubmit = (e) => {
		e.preventDefault();
		if (this.state.txHashInput) {
			this.setState({ txHashActive: this.state.txHashInput });
			this.props.history.push('/tx/'+this.state.txHashInput);
		}
	}

	render() {
		return (
			<div className="container">
				<TextInput desc="TxHash" name="txHash"
					value={this.state.txHashInput}
					onChange={this.handleChange}
					onSubmit={this.handleSubmit}/>
				<TxDetail txHash={this.state.txHashActive}/>
			</div>
		);
	}
}

class TxDetail extends Component {
	state = {
		tx: {
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
		}
	};

	render() {
		var txHashAlt = this.props.txHash;
		if (!txHashAlt) {
			txHashAlt = ( <span>Input transaction hash to inspect &uarr;</span> );
		}
		console.log('tx = %o', this.state.tx);
		return (
			<div className="container">
				<KeyValueRow k="TxHash" v={txHashAlt} />
				<KeyValueRow k="In chain" v={'index ' + this.state.tx.index + ' in a block at height ' + this.state.tx.height} />
				<KeyValueRow k="Sender" v={this.state.tx.sender} />
				<KeyValueRow k="Type" v={this.state.tx.type} />
				<KeyValueRow k="Nonce" v={this.state.tx.nonce} />
			</div>
		);
	}
}

const TextInput = ({desc, name, value, onChange, onSubmit}) => {
	return (
		<div className="container">
			<form className="d-flex flex-column mt-3" onSubmit={onSubmit}>
				<div className="input-group mb-3">
					<span className="input-group-text" id="basic-addon1">{desc}</span>
					<input type="text" className="form-control"
						name={name} value={value} onChange={onChange}/>
					<button type="submit" className="btn btn-secondary ml-auto">
						Query
					</button>
				</div>
			</form>
		</div>
	);
};

const KeyValueRow = ({ k, v }) => {
	return ( <p> {k} : {v} </p> );
};

export default withRouter(Tx);
