// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { ec as EC } from 'elliptic';
import sha256 from 'js-sha256';
import { RIEInput, RIETextArea } from 'riek';
import { MdAutorenew } from 'react-icons/md';
import * as rpc from '../rpc';
import { Link } from 'react-router-dom'
import { useCookies } from 'react-cookie';

// for faucet ask
import axios from 'axios';

class Demo extends Component {
	state = {
		seller: {},
		buyer: {},
		parcel: {},
		action: null,
		remoteUpdate: false,
	};

	componentDidMount() {
		if (this.state.seller.seed) {
			this.setSellerAddress(this.state.seller.seed);
			this.setState({remoteUpdate: true});
		}
		if (this.state.buyer.seed) {
			this.setBuyerAddress(this.state.buyer.seed);
			this.setState({remoteUpdate: true});
		}
	}

	componentDidUpdate(props, state) {
		if (this.state.remoteUpdate) {
			this.remoteUpdate();
			this.setState({remoteUpdate: false});
		}
	}

	setSellerAddress = (seed) => {
		this.setState({ action: 'seller', seller: this.makeNewAccount(seed) });
		this.setState({remoteUpdate: true});
	};

	setBuyerAddress = (seed) => {
		this.setState({ action: 'buyer', buyer: this.makeNewAccount(seed) });
		this.setState({remoteUpdate: true});
	};

	makeNewAccount = (seed) => {
		var ec = new EC('p256');
		const ecKey = ec.keyFromPrivate(sha256(seed));
		const pub= ecKey.getPublic().encode();
		const address = sha256(pub).slice(0,40);
		return { seed: seed, address: address, ecKey: ecKey, balance: 0 };
	};

	setParcelId = (id) => {
		var parcel = this.state.parcel;
		parcel.id = id;
		this.setState({ parcel: parcel });
		this.setState({remoteUpdate: true});
	};

	setKeyCustody = (custody) => {
		var parcel = this.state.parcel;
		parcel.custody = custody;
		this.setState({ parcel: parcel });
		this.setState({remoteUpdate: true});
	};

	setExtra = (extra) => {
		var parcel = this.state.parcel;
		parcel.extra = extra;
		this.setState({ parcel: parcel });
		this.setState({remoteUpdate: true});
	};

	sendRegister = () => {
		if (this.state.seller.ecKey) { // sanity check
			rpc.registerParcel(
				this.state.parcel,
				this.state.seller,
				(res) => {
					this.setState({ action: 'register' });
					this.setState({ remoteUpdate: true });
				},
				(err) => {
					alert('error = ' + err.message + ': ' + err.data);
				}
			);
		}
	};

	sendDiscard = () => {
		if (this.state.seller.ecKey) { // sanity check
			rpc.discardParcel(
				this.state.parcel,
				this.state.seller,
				(res) => {
					this.setState({ action: 'discard' });
					this.setState({ remoteUpdate: true });
				},
				(err) => {
					alert('error = ' + err.message + ': ' + err.data);
				}
			);
		}
	};

	sendRequest = (payment) => {
		if (this.state.buyer.ecKey) { // sanity check
			rpc.requestParcel(
				this.state.parcel,
				payment,
				this.state.buyer,
				(res) => {
					this.setState({ action: 'request' });
					this.setState({ remoteUpdate: true });
				},
				(err) => {
					alert('error = ' + err.message + ': ' + err.data);
				}
			);
		}
	};

	sendCancel = () => {
		if (this.state.buyer.ecKey) { // sanity check
			rpc.cancelRequest(
				this.state.parcel,
				this.state.buyer,
				(res) => {
					this.setState({ action: 'cancel' });
					this.setState({ remoteUpdate: true });
				},
				(err) => {
					alert('error = ' + err.message + ': ' + err.data);
				}
			);
		}
	};

	sendGrant = (custody) => {
		if (this.state.seller.ecKey) { // sanity check
			rpc.grantParcel(
				this.state.parcel,
				this.state.buyer,
				custody,
				this.state.seller,
				(res) => {
					this.setState({ action: 'grant' });
					this.setState({ remoteUpdate: true });
				},
				(err) => {
					alert('error = ' + err.message + ': ' + err.data);
				}
			);
		}
	};

	sendRevoke = () => {
		if (this.state.seller.ecKey) { // sanity check
			rpc.revokeGrant(
				this.state.parcel,
				this.state.buyer,
				this.state.seller,
				(res) => {
					this.setState({ action: 'revoke' });
					this.setState({ remoteUpdate: true });
				},
				(err) => {
					alert('error = ' + err.message + ': ' + err.data);
				}
			);
		}
	};

	remoteUpdate = () => {
		if (this.state.seller.address) {
			rpc.fetchBalance(this.state.seller.address, (balance) => {
				var seller = this.state.seller;
				seller.balance = balance;
				this.setState({ seller: seller })
			});
		}
		if (this.state.buyer.address) {
			rpc.fetchBalance(this.state.buyer.address, (balance) => {
				var buyer = this.state.buyer;
				buyer.balance = balance;
				this.setState({ buyer: buyer })
			});
		}
		if (this.state.parcel.id) {
			rpc.fetchParcel(this.state.parcel.id, (res) => {
				var owner, custody;
				if (res) {
					owner = res.owner;
					custody = res.custody;
				} else {
					owner = '';
					custody = this.state.parcel.custody;
				}
				var parcel = this.state.parcel;
				parcel.owner = owner;
				parcel.custody = custody;
				this.setState({ parcel: parcel });
			});
			if (this.state.buyer.address) {
				rpc.fetchRequest(this.state.buyer.address, this.state.parcel.id, (res) => {
					var buyer, payment;
					if (res) {
						buyer = this.state.buyer.address;
						payment = res.payment;
					} else {
						buyer = '';
						payment = null;
					}
					var parcel = this.state.parcel;
					parcel.buyer = buyer.toUpperCase();
					parcel.payment = payment;
					this.setState({ parcel: parcel });
				});
				rpc.fetchUsage(this.state.buyer.address, this.state.parcel.id, (res) => {
					var grant, custody;
					if (res) {
						grant = this.state.buyer.address;
						custody = res.custody;
					} else {
						grant = '';
						custody = '';
					}
					var parcel = this.state.parcel;
					parcel.grant = grant.toUpperCase();
					parcel.buyerCustody = custody.toUpperCase();
					this.setState({ parcel: parcel });
				});
			}
		}
	};

	render() {
		return (
			<div className="container">
				<div className="container">
					Demo main. Some descriptions here.
				</div>
				<StepGuide state={this.state} />
				<div className="container">
					Refresh
					<button
						type="button"
						onClick={()=>{this.setState({remoteUpdate:true});}}
						style={{cursor:"pointer",border:"0px"}}
					>
						<MdAutorenew/>
					</button>
					(Don't reload the page. Click the refresh icon.)
				</div>
				<div className="container row">
					<div className="col-md-6">
						<DemoAccount
							which='seller'
							account={this.state.seller}
							onInputSeed={this.setSellerAddress}
						/>
						<DemoAccount
							which='buyer'
							account={this.state.buyer}
							onInputSeed={this.setBuyerAddress}
						/>
						<DemoParcel
							parcel={this.state.parcel}
							onInputParcelId={this.setParcelId}
							onInputCustody={this.setKeyCustody}
							onInputExtra={this.setExtra}
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
						<Trader
							seller={this.state.seller}
							buyer={this.state.buyer}
							parcel={this.state.parcel}
							onRegister={this.sendRegister}
							onDiscard={this.sendDiscard}
							onRequest={this.sendRequest}
							onCancel={this.sendCancel}
							onGrant={this.sendGrant}
							onRevoke={this.sendRevoke}
						/>
					</div>
				</div>
			</div>
		);
	}
}

function askForCoin(ecKey) {
	const address = sha256(ecKey.getPublic().encode()).slice(0,40);
	//console.log('ask for coin with the address:', address);
	const reqBody = JSON.stringify({ recp: address });
	axios.post(
		'http://139.162.116.176:2000', reqBody,
		{
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*',
			}
		}
	)
		.then(res => {
			//console.log('res =', res);
		});
}

const DemoAccount = ({which, account, onInputSeed}) => {
	const [cookies, setCookie] = useCookies([ 'seedseller', 'seedbuyer' ]);

	var faucetLink = (<div className="container"></div>);
	if (!account) { // this is for a fail-safe. not needed really
		account = {seed: null, address: null, ecKey: null, balance: 0};
	}
	// if the balance is less than one AMO
	if (account.address && account.balance === 0) {
		faucetLink = (
			<div className="container">
				<button onClick={()=>{askForCoin(account.ecKey);}}>
					Ask for coin
				</button>
			</div>
		);
	}
	var heading = 'Account';
	var seedcookie;
	if (which == 'seller') {
		heading = 'Seller account';
		seedcookie = cookies.seedseller;
	} else if (which == 'buyer') {
		heading = 'Buyer account';
		seedcookie = cookies.seedbuyer;
	}
	if (!account.seed) account.seed = seedcookie;

	return (
		<div className="container round-box">
			<b>{heading}</b>
			<div>seed from cookies: {seedcookie}</div>
			<div className="container">
				Seed:&nbsp;
				<RIEInput
					value={account.seed?account.seed:'input seed string and press enter'}
					propName="seed"
					change={(prop) => {
						setCookie('seed'+which, prop.seed);
						onInputSeed(prop.seed);
					}}
					className="rie-inline"
					defaultProps={
						account.seed?{}:{style:{fontStyle:"italic",color:"gray"}}
					}
				/>
			</div>
			<div className="container">
				Address: {
					account.address?
						account.address:
						(<span style={{fontStyle:"italic",color:"gray"}}>not generated yet</span>)
				}
			</div>
			<div className="container">
				Balance: {account.balance}
			</div>
			{faucetLink}
		</div>
	);
};

const DemoParcel = ({parcel, onInputParcelId, onInputCustody, onInputExtra}) => {
	const [cookies, setCookie] = useCookies([ 'parcelid' ]);

	var parcelLink;
	if (!parcel) {
		parcel = {id: null, owner: null, custody: null, extra: null, buyer: null};
	}

	if (!parcel.id) parcel.id = cookies.parcelid;
	if (parcel.id) {
		parcelLink = (<Link to={'/parcel/' + parcel.id}>parcel page</Link>);
	}

	return (
		<div className="container round-box">
			<b>Data parcel</b> {parcelLink}
			<div className="container">
				<div>Parcel ID:&nbsp;
					<RIEInput
						value={parcel.id?parcel.id:'input id and press enter'}
						propName="id"
						change={(prop) => {
							setCookie('parcelid', prop.id);
							onInputParcelId(prop.id);
						}}
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
				<hr className="shallow"/>
				<div>Owner: {parcel.owner}</div>
				<hr className="shallow"/>
				<div>Buyer: {parcel.buyer}</div>
				<div>Pledged payment: {parcel.payment}</div>
				<hr className="shallow"/>
				<div>Grant: {parcel.grant}</div>
				<div>Key custody: {parcel.buyerCustody}</div>
			</div>
		</div>
	);
};

class Trader extends Component {
	state = {
		view: null,
		paymentInput: 0,
		custodyInput: '',
	};

	componentDidMount() {
		this.setState({ view: this.decideView() });
	}

	componentDidUpdate(props, state) {
		if (this.props !== props) {
			this.setState({ view: this.decideView() });
		}
	}

	handleReqChange = (e) => {
		e.preventDefault();
		this.setState({ paymentInput: e.target.value });
	};

	handleReqSubmit = (e) => {
		e.preventDefault();
		const payment = this.state.paymentInput;
		this.props.onRequest(payment);
	};

	handleGrantChange = (e) => {
		e.preventDefault();
		this.setState({ custodyInput: e.target.value });
	};

	handleGrantSubmit = (e) => {
		e.preventDefault();
		const custody = this.state.custodyInput;
		this.props.onGrant(custody);
	};

	decideView = () => {
		var seller = this.props.seller;
		var buyer = this.props.buyer;
		var parcel = this.props.parcel;

		if (seller && seller.address
			&& parcel && parcel.id && parcel.custody
			&& !parcel.owner
		) {
			return 'register';
		} else if (buyer && buyer.address
			&& parcel && parcel.owner
			&& parcel.buyer !== buyer.address.toUpperCase()
			&& parcel.grant !== buyer.address.toUpperCase()
		) {
			return 'request';
		} else if (seller && seller.address
			&& parcel && parcel.buyer
			&& parcel.buyer === buyer.address.toUpperCase()
		) {
			return 'grant';
		} else if (seller && seller.address
			&& parcel && parcel.grant
			&& parcel.owner === seller.address.toUpperCase()
		) {
			return 'revoke';
		} else {
			return null;
		}
	};

	render() {
		var msg;
		if (this.state.view) {
			msg = "Ready to send transactions.";
		} else {
			msg = "Please setup demo accounts and parcel data.";
		}

		var view;
		switch (this.state.view) {
			case 'register':
				view = (
					<div className="container">
						<div>
							Click the button <b>Register</b> to register data parcel on
							behalf of the <b>seller</b>.
						</div>
						<button type="button" onClick={this.props.onRegister}>
							Register
						</button>
					</div>
				);
				break;
			case 'request':
				view = (
					<div className="container">
						<div>
							Click the button <b>Request</b> to request a data parcel on
							behalf of the <b>buyer</b>.
						</div>
						<form onSubmit={this.handleReqSubmit}>
							Pledged payment:&nbsp;
							<input
								type="number"
								name="payment"
								value={this.state.paymentInput}
								onChange={this.handleReqChange}
							/>
							<button type="submit">
								Request
							</button>
						</form>
						<hr className="shallow"/>
						<div>
							Click the button <b>Discard</b> to discard the registered parcel
							on behalf of the <b>seller</b>.
						</div>
						<button type="button" onClick={this.props.onDiscard}>
							Discard
						</button>
					</div>
				);
				break;
			case 'grant':
				view = (
					<div className="container">
						<div>
							Click the button <b>Grant</b> to grant a data parcel request on
							behalf of the <b>seller</b>.
						</div>
						<form onSubmit={this.handleGrantSubmit}>
							Key custody:&nbsp;
							<input
								type="text"
								name="custody"
								value={this.state.custodyInput}
								onChange={this.handleGrantChange}
							/>
							<button type="submit">
								Grant
							</button>
						</form>
						<hr className="shallow"/>
						<div>
							Click the button <b>Cancel</b> to cancel the parcel request on
							behalf of the <b>buyer</b>.
						</div>
						<button type="button" onClick={this.props.onCancel}>
							Cancel
						</button>
					</div>
				);
				break;
			case 'revoke':
				view = (
					<div className="container">
						<div>
							Click the button <b>Revoke</b> to revoke a granted data parcel on
							behalf of the <b>seller</b>.
						</div>
						<button type="button" onClick={this.props.onRevoke}>
							Revoke
						</button>
					</div>
				);
				break;
			default:
				view = (<div/>);
				break;
		}

		return (
			<div className="container round-box trader">
				<b>Trading demo</b>
				<div className="container" style={{color:"blue"}}>{msg}</div>
				{view}
			</div>
		);
	};
}

const StepGuide = ({state}) => {
	var msg;
	if (!state.seller.address) {
		msg = (<span>Generate a seller account by setting a seed string. The generated key will not be shown on the screen, and stored in the browser's memory only. The seed string used to generate the key pair will be stored as a <b>browser cookie</b>. Of course, you can remember your seed string and reuse that in the future.</span>);
	} else if (!state.buyer.address) {
		msg = (<span>Generate a buyer account by setting a seed string. The generated key will not be shown on the screen, and stored in the browser's memory only. The seed string used to generate the key pair will be stored as a <b>browser cookie</b>. Of course, you can remember your seed string and reuse that in the future.</span>);
	} else if (!state.parcel.id) {
		msg = (<span>Enter data parcel ID as a <b>hexadecimal</b> string (without <code>0x</code> prefix). A parcel ID is used to identify and merchadize any data item in AMO ecosystem.</span>);
	} else if (!state.parcel.custody) {
		msg = (<span>Enter key custody information of this data parcel as a <b>dexadecimal</b> string. This custody is used to store owner's data encryption key. Encryption feature is not ready for this demo page, so key custody has no meaning for now. Just type in any hexadecimal string.</span>);
	} else if (!state.parcel.extra) {
		msg = (<span>Enter some extra information of this data parcel. This extra information would be used to decide the lifetime of the data. But this feature is not ready for this demo page, so you may enter any string here.</span>);
	} else if (state.buyer.balance === 0 || state.buyer.balance === '0') {
		msg = (<span>Now you need to acquire some AMO coins for the buyer to perform actual data trading. Open a <b>new</b> browser window or tab and visit the <a href="https://testnet.amolabs.io">faucet site</a> and acquire some.</span>);
	} else if (!state.parcel.owner) {
		msg = (<span>Everything has been setup and you can try some trading actions now. First, you need to send a <b>Register</b> transaction to register your demo parcel on AMO blockchain. This step is essential for other users to request your data. Click the <b>Register</b> button in the <b>Trading demo</b> box.</span>);
	} else if (!state.parcel.buyer && !state.parcel.grant) {
		msg = (<span>You've piched your first data on AMO blockchain. Good. Now, perform some action on behalf of a buyer. A buyer can send a <b>Request</b> transaction to inform the owner(<em>seller account</em>) of a data parcel that he/she wants to use the data. This action requires some coins as a payment to the data owner. Yes, this is a kind of escrow mechanism. You need to deposit the money first, and you will see that buyer's balance is reduced by the payment amount. Click the <b>Request</b> button in the <b>Trading demo</b> box. <b>Alternatively</b>, you can click the <b>Discard</b> button. In that case, data parcel in question will be discarded and AMO blockchain will forget about it.</span>);
	} else if (!state.parcel.grant) {
		msg = (<span>Now you have a data, and both of a seller and a buyer. And the buyer wants to buy the permission to use the data with some money as a pledged payment. You can click the <b>Grant</b> button to grant the <em>request</em> on behalf of the seller, and the seller will collect the pledged payment. When you grant a request, you need to specify a key custody. This key custody is not the one you entered in the <b>Data parcel</b> box. A key custody carried with the Grant transaction is for the buyer. Typically, it would be a data encryption key <em>encrypted</em> with the buyer's public key. The encryption feature is not ready yet, so you can enter any hexadecimal string here.</span>);
	} else {
		msg = (<span>Have you noticed that the seller's balance was increased by the buyer's pledged payment? Here ends the basic cycle of the data trading.</span>);
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
		case 'discard':
			parcel = state.parcel;
			cmd = 'amocli tx discard '+parcel.id;
			break;
		case 'request':
			parcel = state.parcel;
			cmd = 'amocli tx request '+parcel.id+' '+0;
			guide = (<span className="gray">This command will request a data parcel in the AMO blockchain on behalf of the buyer, with parcel id <b>{parcel.id}</b> and payment <b>0</b>.</span>);
			break;
		case 'cancel':
			parcel = state.parcel;
			cmd = 'amocli tx cancel '+parcel.id;
			break;
		case 'grant':
			parcel = state.parcel;
			cmd = 'amocli tx grant '+parcel.id+' '+state.buyer.address+' 1f1f';
			break;
		case 'revoke':
			parcel = state.parcel;
			cmd = 'amocli tx revoke '+parcel.id+' '+state.buyer.address;
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
