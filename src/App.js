import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import NavBar from './components/NavBar';
import Home from './pages/Home';
import Blocks from './pages/Blocks';
import Transactions from './pages/Transactions';
import Block from './pages/Block';

class App extends Component {
	render() {
		return (
			<BrowserRouter>
				<div>
					<NavBar />
					<Switch>
						<Route exact path="/" component={Home} />
						<Route exact path="/blocks" component={Blocks} />
						<Route exact path="/txs" component={Transactions} />
						<Route
							exact
							path="/block/:blockHeight"
							component={Block}
						/>
					</Switch>
				</div>
			</BrowserRouter>
		);
	}
}

export default App;
