import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import NavBar from './components/NavBar';
import Home from './pages/Home';
import Blocks from './pages/Blocks';
import Transactions from './pages/Transactions';

import { ws, subscribeRPC, getLatestBlock } from './rpc';

class App extends Component {
	state = {
		latestHeight: null,
	};

	componentDidMount() {
		// register callbacks for web socket
		ws.onopen = () => {
			getLatestBlock(block => {
				this.setState({ latestHeight: block.height });
				ws.send(subscribeRPC);
			});
		};
		ws.onmessage = e => {
			const message = JSON.parse(e.data);
			if (message.id === 'newBlock#event') {
				const block = message.result.data.value.block;
				this.setState({ latestHeight: block.header.height });
			}
		};
		ws.onerror = e => {
			console.error('web socket error: ', e);
			alert('Please check if Tendermint is running and then refresh.');
		};
	}

	render() {
		return (
			<div>
				<NavBar />
				<Switch>
					<Route
						exact
						path="/"
						render={props => (
							<Home
								{...props}
								latestHeight={this.state.latestHeight}
							/>
						)}
					/>
					<Route
						exact
						path="/blocks"
						component={props => (
							<Blocks
								{...props}
								latestHeight={this.state.latestHeight}
							/>
						)}
					/>
					<Route exact path="/txs" component={Transactions} />
				</Switch>
			</div>
		);
	}
}

export default App;
