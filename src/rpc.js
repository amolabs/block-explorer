// vim: set noexpandtab ts=2 sw=2 :
import axios from 'axios';
import sha256 from 'sha256';
import crypto from 'crypto';

//const HOST = 'localhost:26657';
//const HOST = '192.168.50.88:26657';
const HOST = '139.162.116.176:26657';
const wsURL = `ws://${HOST}/websocket`;
const httpURL = `http://${HOST}`;

let ws;

/* web socket based new block subscription */
export function startSubscribe(onNewBlock, onError) {
	ws = new WebSocket(wsURL);

	// register callbacks for web socket
	ws.onopen = () => {
		ws.send(
			JSON.stringify({
				jsonrpc: '2.0',
				method: 'subscribe',
				id: 'newBlock',
				params: {
					query: "tm.event='NewBlock'",
				}
			})
		);
	};
	ws.onmessage = e => {
		const message = JSON.parse(e.data);
		if (message.id === 'newBlock#event') {
			const blockHeader = message.result.data.value.block.header;
			onNewBlock(blockHeader.height);
		}
	};
	ws.onerror = onError;
}

//////// block query rpc

function formatBlockHeader(blk) {
	return {
		chain: blk.header.chain_id,
		hash: blk.block_id.hash,
		height: blk.header.height,
		proposer: blk.header.proposer_address,
		numTx: blk.header.num_txs,
		timestamp: blk.header.time,
	};
}

export function fetchLastBlock(callback) {
	axios.get(`${httpURL}/block`).then(res => {
		callback(formatBlockHeader(res.data.result.block_meta));
	});
}

export function fetchLastHeight(callback) {
	fetchLastBlock(result => {
		callback(parseInt(result.height));
	});
}

function formatBlock(blk) {
	if (!blk.data.txs) {
		blk.data.txs = [];
	}
	return {
		chain: blk.header.chain_id,
		height: blk.header.height,
		proposer: blk.header.proposer_address,
		numTx: blk.header.num_txs,
		timestamp: blk.header.time,
		txs: blk.data.txs.map(a => {
			var tx = JSON.parse(atob(a));
			tx.hash = sha256(atob(a));
			return tx;
		}),
	};
}

export function fetchBlock(height, callback) {
	axios.get(`${httpURL}/block?height=${height}`).then(
		res => {
			if ('error' in res.data) {
				callback({});
			} else {
				callback(formatBlock(res.data.result.block));
			}
		}
	);
}

export function fetchBlockHeaders(maxHeight, count, callback) {
	const minHeight = Math.max(1, maxHeight - count + 1);
	axios
		.get(
			`${httpURL}/blockchain?maxHeight=${maxHeight}&minHeight=${minHeight}`
		)
		.then(res => {
			callback(
				res.data.result.block_metas.map(formatBlockHeader)
			);
		});
}

export function fetchRecentBlockHeaders(callback) {
	// will retrieve most recent 20 block headers
	axios.get(`${httpURL}/blockchain`).then(res => {
		callback(
			res.data.result.block_metas.map(formatBlockHeader)
		);
	});
}

//////// tx query rpc

function formatTx(tmTx) {
	return {
		hash: tmTx.hash,
		height: tmTx.height,
		index: tmTx.index,
		txResult: tmTx.tx_result,
		type: tmTx.tx.type,
		sender: tmTx.tx.sender,
		nonce: tmTx.tx.nonce,
		payload: tmTx.tx.payload,
		pubkey: tmTx.tx.signature.pubkey,
		sigBytes: tmTx.tx.signature.sig_bytes,
	};
}

// TODO: signature and pubkey
export function fetchTx(hash, callback) {
	axios.get(`${httpURL}/tx?hash=0x${hash}`).then(
		res => {
			if ('error' in res.data) {
				callback({});
			} else {
				var tmTx = res.data.result;
				tmTx.tx = JSON.parse(atob(tmTx.tx));
				callback(formatTx(tmTx));
			}
		}
	);
}

export function fetchRecentTxs(callback) {
	fetchRecentBlockHeaders(blocks => {
		const promises = blocks
			.filter(b => b.numTx > 0)
			.map(b => axios.get(`${httpURL}/block?height=${b.height}`));

		Promise.all(promises).then(responses => {
			callback(
				[]
				.concat(
					...responses.map(res => res.data.result.block.data.txs)
				)
				.map(tx => {
					return {
						hash: sha256(atob(tx)),
						...JSON.parse(atob(tx)),
					};
				})
			);
		});
	});
}

// TODO: pagination
export function fetchAccountTxs(address, callback) {
	axios.get(`${httpURL}/tx_search?query="tx.sender='${address}'"`).then(
		res => {
			callback(res.data.result.txs.map(tx => {
				tx.tx = JSON.parse(atob(tx.tx))
				return formatTx(tx);
			}));
		}
	);
}

//////// abci query rpc

export function abciQuery(type, params, onSuccess, onError) {
	let data;
	data = JSON.stringify(params).replace(/"/g, '\\"');

	axios
		.get(`${httpURL}/abci_query?path="/${type}"&data="${data}"`)
		.then(res => {
			if (res.data.error) onError(res.data.error);
			else onSuccess(res.data.result.response.value);
		});
}

export function fetchBalance(address, callback) {
	abciQuery('balance', address,
		res => { callback(parseBalance(res)); },
		err => { callback(0); }
	);
}

export function fetchStake(address, callback) {
	abciQuery('stake', address,
		res => { callback(parseStake(res)); },
		err => { callback(0); } // TODO: check this
	);
}

export function fetchParcel(id, callback) {
	abciQuery('parcel', id,
		res => { callback(parseParcel(res)); },
		err => { callback(0); } // TODO: check this
	);
}

function parseBalance(result) {
	return JSON.parse(atob(result));
}

function parseStake(result) {
	var parsed = JSON.parse(atob(result));
	if (!parsed) parsed = {amount:0,validator:[]};
	const stake = {
		amount: parsed.amount,
		validator: parsed.validator, // TODO
	};
	return stake
}

function parseParcel(result) {
	var parsed = JSON.parse(atob(result));
	if (!parsed) parsed = { owner: null, custody: [] };
	const parcel = {
		owner: parsed.owner,
		custody: parsed.custody, // TODO: byte array
	};
	return parcel;
}

//////// send tx rpc

function sendTx(tx, callback, errCallback) {
	var escaped = tx.replace(/"/g, '\\"');
	axios.post(`${httpURL}/broadcast_tx_commit?tx="${escaped}"`)
		.then(res => {
			if (res.data.error) {
				// tendermint error
				errCallback(res.data.error);
			} else if (res.data.result.check_tx.code > 0) {
				// abci check_tx error
				errCallback({
					// TODO: human readable error reason
					message: 'abci error code '+res.data.result.check_tx.code,
					data: null,
				});
			} else if (res.data.result.deliver_tx.code > 0) {
				// abci deliver_tx error
				errCallback({
					// TODO: human readable error reason
					message: 'abci error code '+res.data.result.deliver_tx.code,
					data: null,
				});
			} else {
				callback(res.data);
			}
		});
}

function signTx(tx, key) {
	const sig = key.sign(sha256(JSON.stringify(tx)));
	const r = ('0000'+sig.r.toString('hex')).slice(-64); // fail-safe
	const s = ('0000'+sig.s.toString('hex')).slice(-64); // fail-safe

	tx.signature = {
		pubkey: key.getPublic().encode('hex'),
		sig_bytes: r + s,
	};

	return tx;
}

export function registerParcel(parcel, sender, callback, errCallback) {
	if (!sender || !sender.ecKey) {
		errCallback({message: 'no sender key', data: 'sender.ecKey is null'});
		return;
	}

	var tx = {
		type: 'register',
		sender: sender.address.toUpperCase(),
		nonce: crypto.randomBytes(4).toString('hex').toUpperCase(),
		payload: {
			target: parcel.id.toUpperCase(),
			custody: parcel.custody.toUpperCase(),
		},
	};

	var rawTx = JSON.stringify(signTx(tx, sender.ecKey));
	sendTx(rawTx, callback, errCallback);
}

