import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import NavBar from './components/NavBar';
import Home from './pages/Home';
import Blocks from './pages/Blocks';
import Transactions from './pages/Transactions';

const rpcAddr = 'ws://localhost:26657/websocket';
const ws = new WebSocket(rpcAddr);

ws.onopen = e => {
	ws.send(
		JSON.stringify({
			jsonrpc: '2.0',
			method: 'subscribe',
			id: 0,
			params: {
				query: "tm.event='NewBlock'",
			},
		})
	);
};

ws.onmessage = e => {
	const message = JSON.parse(e.data);
	if (message.id === '0#event') {
		const result = message.result.data;

		const type = result.type;
		const block = result.block;
		const header = result.value.block.header;

		console.log(`${type}: ${header}`);
	}
};
ws.onerror = e => {
	console.log('Server error message: \n', e.data);
};

class App extends Component {
	render() {
		return (
			<div>
				<NavBar />
				<Switch>
					<Route exact path="/" component={Home} />
					<Route exact path="/blocks" component={Blocks} />
					<Route exact path="/txs" component={Transactions} />
				</Switch>
			</div>
		);
	}
}

export default App;
