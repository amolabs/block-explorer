// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import NavBar from './components/NavBar';
import Home from './pages/Home';
import Blocks from './pages/Blocks';
import Block from './pages/Block';
import Tx from './pages/Tx';
import Account from './pages/Account';
import Validator from './pages/Validator';
import Query from './pages/Query';

class App extends Component {
	render() {
		return (
			<BrowserRouter>
				<div>
					<NavBar />
					<Switch>
						<Route exact path="/" component={Home} />
						<Route exact path="/blocks" component={Blocks} />
						<Route exact path="/block" component={Block} />
						<Route exact path="/block/:height" component={Block} />
						<Route exact path="/tx" component={Tx} />
						<Route exact path="/tx/:txHash" component={Tx} />
						<Route exact path="/account" component={Account} />
						<Route exact path="/account/:address" component={Account} />
						<Route exact path="/validator" component={Validator} />
						<Route exact path="/validator/:address" component={Validator} />
						<Route exact path="/query" component={Query} />
					</Switch>
				</div>
			</BrowserRouter>
		);
	}
}

export default App;
