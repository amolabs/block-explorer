// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { ec as EC } from 'elliptic';
import sha256 from 'sha256';
import { RIEInput, RIETextArea } from 'riek';

class Demo extends Component {
	state = {
		seller: { seed: null, address: null, ecKey: null, },
		buyer: { seed: null, address: null, ecKey: null, },
		parcel: { id: null, custody: null, extra: null },
	};

	updateSeller = (seed) => {
		this.setState({ seller: this.makeNewAccount(seed) });
	};

	updateBuyer = (seed) => {
		this.setState({ buyer: this.makeNewAccount(seed) });
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

	render() {
		return (
			<div className="container">
				<div className="container">Demo main. Some descriptions here.</div>
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
						<div className="container">
							Click <span style={{borderBottom: "dashed gray 1px"}}>underlined
							item</span> to edit. Seed input can be any string. Parcel ID and
							key custody must be hexadecimal strings. Since extra info does
							nothing import for now, just input anything you want.
						</div>
					</div>
					<div className="col-md-6">
						<ConsoleGuide state={this.state}/>
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
			{heading}
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
					value={account.seed?account.seed:'input seed and press enter'}
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
			Data parcel
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

const ConsoleGuide = ({state}) => {
	var cmd = 'no command';
	if (!state.seller || !state.seller.ecKey) {
		console.log('seller =', state.seller);
		cmd = 'amocli key generate demo1 --seed=demo1 --encrypt=false'
	} else if (!state.parcel || !state.parcel.id || !state.parcel.custody) {
		cmd = 'amocli tx register 11ef11ef 0f0f0f0f'
	}

	return (
		<div className="container round-box">
			Console command for your previous action(It's one line!):
			<pre className="block-code">{cmd}</pre>
		</div>
	);
}

export default Demo;
