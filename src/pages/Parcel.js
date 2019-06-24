// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { TxBriefList } from '../components/Tx';
import { TextInput, KeyValueRow, accountLink } from '../util';
import { fetchParcel, fetchTxsByParcel } from '../rpc';
import AWS from 'aws-sdk';
import sha256 from 'js-sha256';

const s3endpoint = 'http://172.105.221.117:7480';
const s3accessKey = '65IDDDG7C7UB1NAIJM7Z';
const s3secretKey = 'rRoRko915CCU20l1T2LnDWIyLuwsY4MrLcf0lJgZ';
const s3bucket = 'raw';

class Parcel extends Component {
	state = {
		parcelID: this.props.match.params.parcelID,
	};

	componentDidUpdate(prevProps) {
		if (this.props.match.params.parcelID !== prevProps.match.params.parcelID) {
			const parcelID = this.props.match.params.parcelID;
			this.setState({ parcelID: parcelID });
		}
	}

	updateParcelID = (id) => {
		this.setState({ parcelID: id });
		this.props.history.push('/parcel/'+id);
	}

	render() {
		return (
			<div className="container">
				<TextInput desc="Parcel ID" name="parcelID"
					value={this.state.parcelID}
					button="Query"
					onSubmit={this.updateParcelID}/>
				<ParcelDetail parcelID={this.state.parcelID}/>
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
					this.setState({ parcel: result?result:{} });
				}
			);
		} else {
			this.setState({ parcel: {} });
		}
	};

	render() {
		var parcelIDAlt = this.props.parcelID;
		if (!parcelIDAlt) {
			parcelIDAlt = ( <span>Upload a new file or input parcel ID to inspect &uarr;</span> );
		}
		const parcel = this.state.parcel;
		return (
			<div className="container">
				<KeyValueRow k="Parcel ID" v={parcelIDAlt} />
				<KeyValueRow k="Owner" v={accountLink(parcel.owner)} />
				<KeyValueRow k="Owner Key Custody" v={parcel.custody} />
				<ParcelPayload parcelID={this.props.parcelID}/>
				<ParcelTxs parcelID={this.props.parcelID}/>
			</div>
		);
	}
}

class ParcelPayload extends Component {
	state = {
		payload: null,
		payloadAlt: null,
		s3online: false,
	};

	componentDidMount() {
		this.s3 = new AWS.S3({
			endpoint: s3endpoint,
			accessKeyId: s3accessKey,
			secretAccessKey: s3secretKey,
			s3ForcePathStyle: true,
		});
		this.s3.headBucket({Bucket: s3bucket}, (err, data) => {
			if (!err) {
				this.setState({s3online: true});
			}
		});

		this.updatePayload(this.props.parcelID);
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.parcelID !== prevProps.parcelID
			|| this.state.s3online !== prevState.s3online)
		{
			this.updatePayload(this.props.parcelID);
		}
	}

	updatePayload = (id) => {
		if (!id) {
			this.setState({
				payload: null,
				payloadAlt: null
			});
			return;
		}
		if (this.state.s3online && id) {
			this.setState({payloadAlt: 'loading...'});
			this.s3.getObject({
				Bucket: s3bucket,
				Key: id
			}, (err, data) => {
				if (err) {
					this.setState({
						payload: null,
						payloadAlt: 'failed to get data parcel payload'
					});
				} else {
					this.setState({
						payload: data,
						payloadAlt: null
					});
				}
			});
		}
	}

	uploadPayload = (hash, content) => {
		if (this.s3) {
			this.s3.putObject({
				Bucket: s3bucket,
				Key: hash,
				Body: content,
			}, (err, data) => {
				if (err) console.log(err);
				else console.log('uploaded:', data);
			});
		}
	};

	render() {
		var payload;
		if (this.state.payload) {
			payload = this.state.payload;
		} else {
			payload = {ContentType: null, Body: []};
		}

		var renderedBody;
		if (this.state.payload) {
			renderedBody = (<div>Body: {payload.Body.slice(0,256).toString()}</div>);
		} else if (!this.props.parcelID) {
			renderedBody = (<UploadForm doUpload={this.uploadPayload}/>);
		} else {
			renderedBody = (<div>Body: </div>);
		}

		return (
			<div>
				Payload: {this.state.payloadAlt}
				<div className="container">
					<div>ContentType: {payload.ContentType}</div>
					<div>{renderedBody}</div>
				</div>
			</div>
		);
	}
}

class UploadForm extends Component {
	state = {
		content: null,
	};

	handleChange = (e) => {
		const rd = new FileReader();
		rd.onloadend = () => {
			var fileHash = sha256(rd.result);
			const blob = new Blob([rd.result]); // weird
			this.setState({content: blob, fileHash: fileHash});
		};
		rd.readAsArrayBuffer(e.target.files[0]);
	};

	handleSubmit = () => {
		this.props.doUpload(this.state.fileHash, this.state.content);
	};

	render() {
		return (
			<div style={{border:'2px solid lightgrey'}}>
				<div>
					Select a file to upload:&nbsp;
					<input type="file" onChange={this.handleChange}/>
				</div>
				<font color='red'>Don't upload any sensitive files</font>
				<div>
					File hash: {this.state.fileHash}
				</div>
				<div>
					<button
						type="button"
						onClick={this.handleSubmit}
						disabled={!this.state.content}
					>
						Upload
					</button>
				</div>
			</div>
		);
	}
}

class ParcelTxs extends Component {
	state = { txs: [] };

	componentDidMount() {
		this.updateTxs();
	}

	componentDidUpdate(prevProps) {
		if (this.props.parcelID !== prevProps.parcelID) {
			this.updateTxs();
		}
	}

	updateTxs = () => {
		if (this.props.parcelID) {
			fetchTxsByParcel(this.props.parcelID,
				result => { this.setState({ txs: result }); }
			);
		} else {
			this.setState({ txs: [] });
		}
	};

	// TODO: pagination
	render() {
		return (
			<div>Tx list related to this parcel ({this.state.txs.length} transactions):
				<TxBriefList txs={this.state.txs}/>
			</div>
		);
	}
}

export default withRouter(Parcel);
