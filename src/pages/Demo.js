// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { ec as EC } from 'elliptic';
import sha256 from 'sha256';
import { RIEInput, RIETextArea } from 'riek';
import { registerParcel } from '../rpc';

class Demo extends Component {
	state = {
		seller: { seed: null, address: null, ecKey: null, },
		buyer: { seed: null, address: null, ecKey: null, },
		parcel: { id: null, custody: null, extra: null },
		action: null,
	};

	componentDidMount() {
		if (this.state.seller.seed) {
			this.updateSeller(this.state.seller.seed);
		}
		if (this.state.buyer.seed) {
			this.updateBuyer(this.state.buyer.seed);
		}
	}

	updateSeller = (seed) => {
		this.setState({ action: 'seller', seller: this.makeNewAccount(seed) });
	};

	updateBuyer = (seed) => {
		this.setState({ action: 'buyer', buyer: this.makeNewAccount(seed) });
	};

	makeNewAccount = (seed) => {
		var ec = new EC('p256');
		const ecKey = ec.keyFromPrivate(sha256(seed));
		const pub= ecKey.getPublic().encode();
		const address = sha256(pub).slice(0,40);
		return { seed: seed, address: address, ecKey: ecKey };
	};

	updateParcelId = (id) => {
		this.setState((prevState, props) => {
			var parcel = prevState.parcel;
			parcel.id = id;
			return { parcel: parcel };
		});
	};

	updateKeyCustody = (custody) => {
		this.setState((prevState, props) => {
			var parcel = prevState.parcel;
			parcel.custody = custody;
			return { parcel: parcel };
		});
	};

	updateExtra = (extra) => {
		this.setState((prevState, props) => {
			var parcel = prevState.parcel;
			parcel.extra = extra;
			return { parcel: parcel };
		});
	};

	sendRegister = () => {
		if (this.state.seller.ecKey) { // sanity check
			registerParcel(
				this.state.parcel,
				this.state.seller,
				(res) => {
					this.setState({ action: 'register' });
				},
				(err) => {
					alert('error = ' + err.message + ': ' + err.data);
				}
			);
		}
	};

	render() {
		return (
			<div className="container">
				<div className="container">Demo main. Some descriptions here.</div>
				<StepGuide state={this.state} />
				<div className="container row">
					<div className="col-md-6">
						<DemoAccount
							heading='Seller account'
							account={this.state.seller}
							onInputSeed={this.updateSeller}
						/>
						<DemoAccount
							heading='Buyer account'
							account={this.state.buyer}
							onInputSeed={this.updateBuyer}
						/>
						<DemoParcel
							parcel={this.state.parcel}
							onInputParcelId={this.updateParcelId}
							onInputCustody={this.updateKeyCustody}
							onInputExtra={this.updateExtra}
						/>
						<Trader
							state={this.state}
							onRegister={this.sendRegister}
							onRequest={this.sendRequest}
							onGrant={this.sendGrant}
						/>
						<div className="container">
							Click <span style={{borderBottom: "dashed gray 1px"}}>underlined
							item</span> to edit. Seed input can be any string. Parcel ID and
							key custody must be hexadecimal strings. Since extra info does
							nothing import for now, just input anything you want.
						</div>
					</div>
					<div className="col-md-6">
						<ConsoleGuide state={this.state} />
					</div>
				</div>
			</div>
		);
	}
}

const DemoAccount = ({heading, account, onInputSeed}) => {
	if (!account) { // this is for a fail-safe. not needed really
		account = {seed: null, address: null, ecKey: null};
	}
	return (
		<div className="container round-box">
			<b>{heading}</b>
			<div className="container">
				Address: {
					account.address?
						account.address:
						(<span style={{fontStyle:"italic",color:"gray"}}>not generated yet</span>)
				}
			</div>
			<div className="container">
				Seed:&nbsp;
				<RIEInput
					value={account.seed?account.seed:'input seed string and press enter'}
					propName="seed"
					change={(prop) => {onInputSeed(prop.seed);}}
					className="rie-inline"
					defaultProps={
						account.seed?{}:{style:{fontStyle:"italic",color:"gray"}}
					}
				/>
			</div>
		</div>
	);
};

const DemoParcel = ({parcel, onInputParcelId, onInputCustody, onInputExtra}) => {
	if (!parcel) {
		parcel = {id: null, custody: null};
	}
	return (
		<div className="container round-box">
			<b>Data parcel</b>
			<div className="container">
				{/*<div>Parcel ID(check): {parcel.id}</div>*/}
				{/*<div>Key custody(check): {parcel.custody}</div>*/}
				<div>Parcel ID:&nbsp;
					<RIEInput
						value={parcel.id?parcel.id:'input id and press enter'}
						propName="id"
						change={(prop) => {onInputParcelId(prop.id);}}
						className="rie-inline"
						defaultProps={
							parcel.id?{}:{style:{fontStyle:"italic",color:"gray"}}
						}
					/>
				</div>
				<div>Key custody:&nbsp;
					<RIEInput
						value={parcel.custody?parcel.custody:'input custody and press enter'}
						propName="custody"
						change={(prop) => {onInputCustody(prop.custody);}}
						className="rie-inline"
						defaultProps={
							parcel.custody?{}:{style:{fontStyle:"italic",color:"gray"}}
						}
					/>
				</div>
				<div>Extra info:<br/>
					<RIETextArea
						value={parcel.extra?parcel.extra:'click to edit'}
						propName="extra"
						change={(prop) => {onInputExtra(prop.extra);}}
						className="indented-box"
						defaultProps={
							parcel.extra?{}:{style:{fontStyle:"italic",color:"gray"}}
						}
					/>
				</div>
			</div>
		</div>
	);
};

const Trader = ({state, onRegister, onRequest, onGrant}) => {
	var msg;
	var ready = false;
	if (state
		&& state.seller && state.seller.address
		&& state.buyer && state.buyer.address
		&& state.parcel && state.parcel.id && state.parcel.custody
	) {
		ready = true;
	}

	if (ready) {
		msg = "Trading demo.";
	} else {
		msg = "Please setup two demo accounts and parcel data.";
	}

	return (
		<div className="container round-box trader">
			<div>{msg}</div>
			<div>
				<span className={!ready?"gray":""}>
					<button type="button" disabled={!ready} onClick={onRegister}>
						Register
					</button>
					&nbsp;
					Seller: register a data pacel
				</span>
			</div>
			<div>
				<span className={!ready?"gray":""}>
					<button type="button" disabled={!ready} onClick={onRequest}>
						Request
					</button>
					&nbsp;
					Buyer: request a granted usage for a data parcel
				</span>
			</div>
			<div>
				<span className={!ready?"gray":""}>
					<button type="button" disabled={!ready} onClick={onGrant}>
						Grant
					</button>
					&nbsp;
					Seller: grant a data parcel usage
				</span>
			</div>
		</div>
	);
};

const StepGuide = ({state}) => {
	var msg;
	if (!state.seller.address) {
		msg = "Generate a seller account by setting a seed string. The generated key will not be shown in this screen, and stored in the browser's memory only. So, if you leave this screen the generated key shall be discarded. In order to use the same key in the future, you need to remember your seed strings.";
	} else if (!state.buyer.address) {
		msg = "Generate a buyer account by setting a seed string. The generated key will not be shown in this screen, and stored in the browser's memory only. So, if you leave this screen the generated key shall be discarded. In order to use the same key in the future, you need to remember your seed strings.";
	} else if (!state.parcel.id) {
		msg = "Enter data parcel ID as a hexadecimal string. A parcel ID is used to identify and merchadize any data item in AMO blockchain environment.";
	} else if (!state.parcel.custody) {
		msg = "Enter key custody information of this data parcel as a dexadecimal string. This custody is used to store owner's data encryption key.";
	} else if (!state.parcel.extra) {
		msg = "Enter some extra information of this data parcel. You may enter any string here.";
	} else {
		msg = "Now you need to acquire some AMO coins for actual data trading.";
	}

	return (
		<div className="container" style={{minHeight:"4em",color:"blue"}} >
			{msg}
		</div>
	);
};

const ConsoleGuide = ({state}) => {
	var cmd;
	var guide;
	var seed;
	var parcel;
	switch (state.action) {
		case 'seller':
			seed = state.seller.seed;
			cmd = 'amocli key generate '+seed +' --seed='+seed;
			guide = (<span className="gray">This command will generate a new key in the local keyring, with username <b>{seed}</b> using "{seed}" for a seed string in the key generation algorithm. A username is just for identifying each key in the local keyring. In the meantime, a seed string is used a randomness seed for the key generation algorithm. So, if you use the same seed string you shall get the same key anywhere, any time.</span>);
			break;
		case 'buyer':
			seed = state.buyer.seed;
			cmd = 'amocli key generate '+seed+' --seed='+seed
			guide = (<span className="gray">This command will generate a new key in the local keyring, with username <b>{seed}</b> using "{seed}" for a seed string in the key generation algorithm. A username is just for identifying each key in the local keyring. In the meantime, a seed string is used a randomness seed for the key generation algorithm. So, if you use the same seed string you shall get the same key anywhere, any time.</span>);
			break;
		case 'register':
			parcel = state.parcel;
			cmd = 'amocli tx register '+parcel.id+' '+parcel.custody;
			guide = (<span className="gray">This command will register a new data parcel to the AMO blockchain, with parcel id <b>{parcel.id}</b> and <b>{parcel.custody}</b> as the owner's key custody.</span>);
			break;
		default:
			cmd = 'no command';
			guide = (<span className="gray"></span>);
			break;
	}

	return (
		<div className="container round-box">
			Console command for your recent action(It's one line!):
			<pre className="block-code">{cmd}</pre>
			{guide}
		</div>
	);
}

export default Demo;
