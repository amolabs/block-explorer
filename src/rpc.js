// vim: set noexpandtab ts=2 sw=2 :
import axios from 'axios';
import sha256 from 'sha256';

//const URL = 'localhost:26657';
//const URL = '192.168.50.88:26657';
const URL = '139.162.116.176:26657';
const wsURL = `ws://${URL}/websocket`;
const curlURL = `http://${URL}`;

let ws;

/* web socket based new block subscription */
export const startSubscribe = (onNewBlock, onError) => {
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
};

/* block related rpc */

const refineBlockMeta = meta => {
	return {
		chain: meta.header.chain_id,
		height: meta.header.height,
		proposer: meta.header.proposer_address,
		numTx: meta.header.num_txs,
		timestamp: meta.header.time,
	};
};

const formatBlock = blk => {
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
};

export const fetchLastBlock = callback => {
	axios.get(`${curlURL}/block`).then(res => {
		callback(refineBlockMeta(res.data.result.block_meta));
	});
};

export const fetchLastHeight = callback => {
	fetchLastBlock(result => {
		callback(parseInt(result.height));
	});
};

export const fetchBlock = (height, callback) => {
	axios.get(`${curlURL}/block?height=${height}`).then(
		res => {
			if ('error' in res.data) {
				callback({});
			} else {
				callback(formatBlock(res.data.result.block));
			}
		}
	);
};

export const fetchBlockMetas = (maxHeight, count, callback) => {
	const minHeight = Math.max(1, maxHeight - count + 1);
	axios
		.get(
			`${curlURL}/blockchain?maxHeight=${maxHeight}&minHeight=${minHeight}`
		)
		.then(res => {
			callback(
				res.data.result.block_metas.map(meta => {
					return refineBlockMeta(meta);
				})
			);
		});
};

export const fetchRecentBlockMetas = callback => {
	// will retrieve most recent 20 block headers
	axios.get(`${curlURL}/blockchain`).then(res => {
		callback(
			res.data.result.block_metas.map(meta => {
				return refineBlockMeta(meta);
			})
		);
	});
};

/* tx related rpc */
const refineTxMeta = meta => {
	return {
		hash: meta.hash,
		height: meta.height,
		index: meta.index,
		txResult: meta.tx_result,
		sender: meta.tx.sender,
		type: meta.tx.type,
		nonce: meta.tx.nonce,
	};
};

export const fetchTx = (hash, callback) => {
	axios.get(`${curlURL}/tx?hash=0x${hash}`).then(
		res => {
			if ('error' in res.data) {
				callback({});
			} else {
				var txMeta = res.data.result;
				txMeta.tx = JSON.parse(atob(res.data.result.tx));
				callback(refineTxMeta(txMeta));
			}
		}
	);
};

export const getTx = (hash, callback) => {
	axios.get(`${curlURL}/tx?hash=0x${hash}`).then(res => {
		const hash = res.data.result.hash;
		const txMsg = res.data.result.tx;

		callback({
			hash: hash,
			...JSON.parse(atob(txMsg)),
		});
	});
};

export const fetchRecentTxs = callback => {
	fetchRecentBlockMetas(blocks => {
		const promises = blocks
			.filter(b => b.numTx > 0)
			.map(b => axios.get(`${curlURL}/block?height=${b.height}`));

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
};

export const fetchAccountByAddress = (address, callback) => {
	var account = { address: address }

	callback( account );
};

export const fetchBalance = (address, callback) => {
	abciQuery('balance', address,
		res => { callback(parseBalance(res)); },
		err => { callback(0); }
	);
};

function parseBalance(result) {
	return JSON.parse(atob(result)); // see btoa() also
}

export const fetchStake = (address, callback) => {
	abciQuery('stake', address,
		res => { callback(parseStake(res)); },
		err => { callback(0); }
	);
};

function parseStake(result) {
	var parsed = JSON.parse(atob(result));
	if (!parsed) parsed = {amount:0,validator:[]};
	const stake = {
		amount: parsed.amount,
		validator: bytes2hex(parsed.validator),
	};
	return stake
}

function bytes2hex(bytes) {
	return bytes.map(b => {return b.toString(16);}).join('');
}

/* query related rpc */
export const abciQuery = (type, params, onSuccess, onError) => {
	let data;
	data = JSON.stringify(params).replace(/"/g, '\\"');

	axios
		.get(`${curlURL}/abci_query?path="/${type}"&data="${data}"`)
		.then(res => {
			if (res.data.error) onError(res.data.error);
			else onSuccess(res.data.result.response.value);
		});
};
