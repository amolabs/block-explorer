// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { TextInput, KeyValueRow } from '../util';
import { fetchBalance, fetchStake } from '../rpc';

class Account extends Component {
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
				<AccountDetail address={this.state.addressActive}/>
			</div>
		);
	}
}

const AccountDetail = ({address}) => {
	// XXX there's nothing useful to manage as 'state' here
	var addressAlt = address;
	if (!address) {
		addressAlt = ( <span>Input account address to inspect &uarr;</span> );
	}
	return (
		<div className="container">
			<KeyValueRow k="Address" v={addressAlt} />
			<Balance address={address}/>
			<Stake address={address}/>
		</div>
	);
};

class Balance extends Component {
	state = { balance: 0 };

	componentDidMount() {
		this.updateBalance();
	}

	componentDidUpdate(prevProps) {
		if (this.props.address !== prevProps.address) {
			this.updateBalance();
		}
	}

	updateBalance = () => {
		if (this.props.address) {
			fetchBalance(this.props.address,
				result => { this.setState({ balance: result }); }
			);
		}
	};

	render() {
		return ( <KeyValueRow k="Balance" v={this.state.balance}/> );
	}
}

class Stake extends Component {
	state = { stake: { amount: 0, validator: null } };

	componentDidMount() {
		this.updateStake();
	}

	componentDidUpdate(prevProps) {
		if (this.props.address !== prevProps.address) {
			this.updateStake();
		}
	}

	updateStake = () => {
		if (this.props.address) {
			fetchStake(this.props.address,
				result => { this.setState({ stake: result }); }
			);
		}
	};

	render() {
		const stake = this.state.stake;
		const desc = stake.amount
			+ (stake.amount ? (' with pubkey ' + stake.validator) : '');
		return ( <KeyValueRow k="Stake" v={desc}/> );
	}
}

export default withRouter(Account);
