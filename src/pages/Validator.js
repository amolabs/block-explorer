// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { TextInput, KeyValueRow } from '../util';

class Validator extends Component {
	state = {
		addressInput: this.props.match.params.address,
		addressActive: this.props.match.params.address,
	};

	componentDidUpdate(prevProps) {
		if (this.props.match.params.address !== prevProps.match.params.address) {
			const address = this.props.match.params.address;
			this.setState({ addressInput: address, addressActive: address });
		}
	}

	handleChange = (e) => {
		this.setState({ addressInput: e.target.value });
	}

	handleSubmit = (e) => {
		e.preventDefault();
		if (this.state.addressInput) {
			this.setState({ addressActive: this.state.addressInput });
			this.props.history.push('/account/'+this.state.addressInput);
		}
	}

	render() {
		return (
			<div className="container">
				<TextInput desc="Address" name="address"
					value={this.state.addressInput}
					onChange={this.handleChange}
					onSubmit={this.handleSubmit}/>
				<ValidatorDetail address={this.state.addressActive}/>
			</div>
		);
	}
}

const ValidatorDetail = ({address}) => {
	// XXX there's nothing useful to manage as 'state' here
	var addressAlt = address;
	if (!address) {
		addressAlt = ( <span>Input validator address to inspect &uarr;</span> );
	}
	return (
		<div className="container">
			<KeyValueRow k="Address" v={addressAlt} />
			<KeyValueRow k="NA" v="Validator detail not yet implemented" />
		</div>
	);
};

export default withRouter(Validator);
