import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import NavBar from './components/NavBar';
import Home from './pages/Home';
import Blocks from './pages/Blocks';
import Transactions from './pages/Transactions';

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
