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
		hash: meta.block_id.hash,
		height: meta.header.height,
		proposer: meta.header.proposer_address,
		numTx: meta.header.num_txs,
		timestamp: meta.header.time,
	};
};

export const getLastBlock = callback => {
	axios.get(`${curlURL}/block`).then(res => {
		callback(refineBlockMeta(res.data.result.block_meta));
	});
};

export const getLastHeight = callback => {
	getLastBlock(result => {
		callback(parseInt(result.height));
	});
};

export const getBlockByHeight = (height, callback) => {
	axios.get(`${curlURL}/block?height=${height}`).then(res => {
		callback(refineBlockMeta(res.data.result.block_meta));
	});
};

export const getBlocks = (maxHeight, count, callback) => {
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

export const getRecentBlocks = callback => {
	axios.get(`${curlURL}/blockchain`).then(res => {
		callback(
			res.data.result.block_metas.map(meta => {
				return refineBlockMeta(meta);
			})
		);
	});
};

/* tx related rpc */
export const getTxByHash = (hash, callback) => {
	axios.get(`${curlURL}/tx?hash=0x${hash}`).then(res => {
		const hash = res.data.result.hash;
		const txMsg = res.data.result.tx;

		callback({
			hash: hash,
			...JSON.parse(atob(txMsg)),
		});
	});
};

export const getRecentTxs = callback => {
	getRecentBlocks(blocks => {
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

/* query related rpc */
export const abciQuery = (type, params, onSuccess, onError) => {
	let data;
	// in case query has single parameter
	if (Object.keys(params).length === 1)
		data = '\\"' + params[Object.keys(params)[0]] + '\\"';
	// in case query has multiple parameter
	else data = JSON.stringify(params).replace(/"/g, '\\"');

	axios
		.get(`${curlURL}/abci_query?path="/${type}"&data="${data}"`)
		.then(res => {
			if (res.data.error) onError(res.data.error);
			else onSuccess(res.data.result.response);
		});
};
