import axios from 'axios';
import sha256 from 'sha256';

const URL = 'localhost:26657';
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
				},
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
		hash: meta.block_id.hash,
		height: meta.header.height,
		miner: meta.header.validators_hash,
		numTx: meta.header.num_txs,
		timestamp: meta.header.time,
	};
};

export const getLatestBlock = callback => {
	axios.get(`${curlURL}/block`).then(res => {
		callback(refineBlockMeta(res.data.result.block_meta));
	});
};

export const getLastHeight = callback => {
	getLatestBlock(result => {
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
