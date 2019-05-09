// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { TextInput, KeyValueRow } from '../util';

class Validator extends Component {
	state = {
		address: this.props.match.params.address,
	};

	componentDidUpdate(prevProps) {
		if (this.props.match.params.address !== prevProps.match.params.address) {
			const address = this.props.match.params.address;
			this.setState({ address: address });
		}
	}

	updateAddress = (address) => {
		this.setState({ address: address });
		this.props.history.push('/account/'+address);
	}

	render() {
		return (
			<div className="container">
				<TextInput desc="Address" name="address"
					value={this.state.address}
					button="Query"
					onSubmit={this.updateAddress}/>
				<ValidatorDetail address={this.state.address}/>
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
