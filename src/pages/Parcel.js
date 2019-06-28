// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { TxBriefList } from '../components/Tx';
import { TextInput, KeyValueRow, accountLink } from '../util';
import { fetchParcel, fetchTxsByParcel } from '../rpc';
import AWS from 'aws-sdk';
import sha256 from 'js-sha256';
import { RIEInput } from 'riek';
import aes from 'browserify-aes';

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

	applyParcelID = (id) => {
		this.setState({ parcelID: id });
		this.props.history.push('/parcel/'+id);
	}

	render() {
		return (
			<div className="container">
				<TextInput desc="Parcel ID" name="parcelID"
					value={this.state.parcelID}
					button="Query"
					onSubmit={this.applyParcelID}
				/>
				<ParcelDetail
					parcelID={this.state.parcelID}
					onChangeID={this.applyParcelID}
				/>
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
				<ParcelPayload
					parcelID={this.props.parcelID}
					onChangeID={this.props.onChangeID}
				/>
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
		encKey: null,
		decrypted: null,
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

		if (prevState.encKey !== this.state.encKey
			|| this.state.payload !== prevState.payload) {
			this.doDecrypt();
		}
	}

	updatePayload = (id) => {
		if (!id) {
			this.setState({
				payload: null,
				payloadAlt: null,
				decrypted: null,
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
						payloadAlt: 'failed to get data parcel payload',
						decrypted: null,
					});
				} else {
					this.setState({
						payload: data,
						payloadAlt: null,
						decrypted: null,
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
				else this.props.onChangeID(hash);
			});
		}
	};

	doDecrypt = () => {
		if (this.state.payload && this.state.payload.Body && this.state.encKey) {
			console.log('do decrypt');
			const cipher = aes.createDecipheriv(
				'AES-256-CTR',
				this.state.encKey,
				Buffer(16, 0)
			);

			let chunk = cipher.update(this.state.payload.Body);
			let final = cipher.final();
			let decrypted = Buffer.concat([chunk, final]);

			this.setState({ decrypted: decrypted });
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
		if (this.state.decrypted) {
			renderedBody = (<div>Body:
				<div className="container">
					<div>
						{this.state.decrypted.slice(0,256).toString()}
					</div>
					<RIEInput
						className="rie-inline"
						value={this.state.encKey?this.state.encKey.toString('hex'):'input encryption key as a hex-encoded string and press enter'}
						propName="hexKey"
						change={(prop) => {
							const encKey = Buffer.alloc(32);
							encKey.write(prop.hexKey, 'hex');
							this.setState({encKey: encKey});
						}}
						defaultProps={
							this.state.encKey?{}:{style:{fontStyle:"italic",color:"gray"}}
						}
					/>
				</div>
			</div>
			);
		} else if (this.state.payload) {
			// this.state.decrypted
			renderedBody = (<div>Body:
				<div className="container">
					<div>
						{payload.Body.slice(0,256).toString()}
					</div>
					<RIEInput
						className="rie-inline"
						value={this.state.encKey?this.state.encKey.toString('hex'):'input encryption key as a hex-encoded string and press enter'}
						propName="hexKey"
						change={(prop) => {
							const encKey = Buffer.alloc(32);
							encKey.write(prop.hexKey, 'hex');
							this.setState({encKey: encKey});
						}}
						defaultProps={
							this.state.encKey?{}:{style:{fontStyle:"italic",color:"gray"}}
						}
					/>
				</div>
			</div>);
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
					{renderedBody}
				</div>
			</div>
		);
	}
}

class UploadForm extends Component {
	state = {
		content: null,
		fileHash: null,
		uploading: false,
		encKey: null,
		encrypted: null,
		encHash: null,
	};

	componentDidUpdate(prevProps, prevState) {
		if (prevState.encKey !== this.state.encKey
			|| prevState.content !== this.state.content) {
			this.doEncrypt();
		}
	}

	doEncrypt = () => {
		if (this.state.encKey && this.state.content) {
			console.log('do encrypt');
			const cipher = aes.createCipheriv(
				'AES-256-CTR',
				this.state.encKey,
				Buffer(16, 0)
			);

			let chunk = cipher.update(this.state.content);
			let final = cipher.final();
			let encrypted = Buffer.concat([chunk, final]);
			let encHash = sha256(encrypted);
			console.log('content len =', this.state.content.length);
			console.log('encrypt len =', encrypted.length);
			this.setState({encrypted: encrypted, encHash: encHash});
		}
	};

	handleFileChange = (e) => {
		const rd = new FileReader();
		rd.onload = () => {
			var fileHash = sha256(rd.result);
			this.setState({content: Buffer(rd.result), fileHash: fileHash});
		};
		rd.readAsArrayBuffer(e.target.files[0]);
	};

	handleSubmit = () => {
		this.setState({uploading: true});
		if (this.state.encrypted) {
			this.props.doUpload(this.state.encHash, this.state.encrypted);
		} else if (this.state.content) {
			this.props.doUpload(this.state.fileHash, this.state.content);
		}
	};

	render() {
		const label = this.state.uploading?'Uploading...':'Upload';
		return (
			<div>
				<div>
					Select a file to upload:&nbsp;
					<input type="file" onChange={this.handleFileChange}/>
				</div>
				<font color='red'>Don't upload any sensitive files</font>
				<div>
					File hash: {this.state.fileHash}
				</div>
				<RIEInput
					className="rie-inline"
					value={this.state.encKey?this.state.encKey.toString('hex'):'input encryption key as a hex-encoded string and press enter'}
					propName="hexKey"
					change={(prop) => {
						const encKey = Buffer.alloc(32);
						encKey.write(prop.hexKey, 'hex');
						this.setState({encKey: encKey});
					}}
					defaultProps={
						this.state.encKey?{}:{style:{fontStyle:"italic",color:"gray"}}
					}
				/>
				<div>
					Encrypted File hash: {this.state.encHash}
				</div>
				<div>
					<button
						type="button"
						onClick={this.handleSubmit}
						disabled={!this.state.content||this.state.uploading}
					>
						{label}
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
