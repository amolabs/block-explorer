// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { fetchBlockHeader } from '../rpc';
import moment from 'moment';

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
		header: {
			height: null,
			chain: null,
			hash: null,
			proposer: null,
			numTx: null,
			time: null,
		}
		// TODO: txs
	};

	componentDidMount() {
		this.updateHeader();
	}

	componentDidUpdate(prevProps) {
		if (this.props.height !== prevProps.height) {
			this.updateHeader();
		}
	}

	updateHeader = () => {
		if (this.props.height) {
			fetchBlockHeader(this.props.height,
				result => {
					this.setState({ header: result });
				}
			);
		}
	};

	render() {
		var heightAlt = this.props.height;
		if (!heightAlt) {
			heightAlt = ( <span>Input block height to inspect &uarr;</span> );
		}
		return (
			<div className="container">
				<KeyValueRow k="Height" v={heightAlt} />
				<KeyValueRow k="Chain-ID" v={this.state.header.chain}/>
				<KeyValueRow k="Hash" v={this.state.header.hash}/>
				<KeyValueRow k="Proposer" v={this.state.header.proposer}/>
				<KeyValueRow k="NumTx" v={this.state.header.numTx}/>
				<KeyValueRow k="Time" v={this.state.header.timestamp}/>
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

export default withRouter(Block);
