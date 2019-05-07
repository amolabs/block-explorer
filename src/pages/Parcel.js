// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { TextInput, KeyValueRow, accountLink } from '../util';
import { fetchParcel } from '../rpc';

class Parcel extends Component {
	state = {
		parcelIDInput: this.props.match.params.parcelID,
		parcelIDActive: this.props.match.params.parcelID,
	};

	componentDidUpdate(prevProps) {
		if (this.props.match.params.parcelID !== prevProps.match.params.parcelID) {
			const parcelID = this.props.match.params.parcelID;
			this.setState({ parcelIDInput: parcelID, parcelIDActive: parcelID });
		}
	}

	handleChange = (e) => {
		this.setState({ parcelIDInput: e.target.value });
	}

	handleSubmit = (e) => {
		e.preventDefault();
		if (this.state.parcelIDInput) {
			this.setState({ parcelIDActive: this.state.parcelIDInput });
			this.props.history.push('/tx/'+this.state.parcelIDInput);
		}
	}

	render() {
		return (
			<div className="container">
				<TextInput desc="Parcel ID" name="parcelID"
					value={this.state.parcelIDInput}
					onChange={this.handleChange}
					onSubmit={this.handleSubmit}/>
				<ParcelDetail parcelID={this.state.parcelIDActive}/>
			</div>
		);
	}
}

class ParcelDetail extends Component {
	state = {
		parcel: {
			owner: "loading...",
			custody: "loading...",
		}
	};

	componentDidMount() {
		this.updateParcel();
	}

	componentDidUpdate(prevProps) {
		if (this.props.parcelID !== prevProps.parcelID) {
			this.updateParcel();
		}
	}

	updateParcel = () => {
		if (this.props.parcelID) {
			fetchParcel(this.props.parcelID,
				result => {
					this.setState({ parcel: result });
				}
			);
		} else {
			this.setState({ parcel: {} });
		}
	};

	render() {
		var parcelIDAlt = this.props.parcelID;
		if (!parcelIDAlt) {
			parcelIDAlt = ( <span>Input parcel ID to inspect &uarr;</span> );
		}
		const parcel = this.state.parcel;
		return (
			<div className="container">
				<KeyValueRow k="Parcel ID" v={parcelIDAlt} />
				<KeyValueRow k="Owner" v={accountLink(parcel.owner)} />
				<KeyValueRow k="Owner Key" v={parcel.custody} />
			</div>
		);
	}
}

export default withRouter(Parcel);
