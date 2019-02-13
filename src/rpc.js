import axios from 'axios';

const URL = 'localhost:26657';
const wsURL = `ws://${URL}/websocket`;
const curlURL = `http://${URL}`;

/* web socket based new block subscription */

export const ws = new WebSocket(wsURL);

export const subscribeRPC = JSON.stringify({
	jsonrpc: '2.0',
	method: 'subscribe',
	id: 'newBlock',
	params: {
		query: "tm.event='NewBlock'",
	},
});

/* curl based data fetch */

const refineBlockData = result => {
	const blockMeta = result.block_meta;
	return {
		hash: blockMeta.block_id.hash,
		height: blockMeta.header.height,
		miner: blockMeta.header.validators_hash,
		numTx: blockMeta.header.num_txs,
		timestamp: blockMeta.header.time,
	};
};

export const getLatestBlock = callback => {
	axios.get(`${curlURL}/block`).then(res => {
		callback(refineBlockData(res.data.result));
	});
};

export const getBlockByHeight = (height, callback) => {
	axios.get(`${curlURL}/block?height=${height}`).then(res => {
		callback(refineBlockData(res.data.result));
	});
};

export const getBlocks = (height, count, callback) => {
	Promise.all(
		Array.from(Array(count).keys()).reduce((result, i) => {
			if (height - i > 0)
				result.push(axios.get(`${curlURL}/block?height=${height - i}`));
			return result;
		}, [])
	).then(responses => {
		callback(
			responses
				.map(res => {
					return refineBlockData(res.data.result);
				})
				.sort((l, r) => {
					return r.height - l.height;
				})
		);
	});
};
