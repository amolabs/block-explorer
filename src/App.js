import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import NavBar from './components/NavBar';
import Home from './pages/Home';
import Blocks from './pages/Blocks';
import Block from './pages/Block';
import Query from './pages/Query';
import Tx from './pages/Tx';

class App extends Component {
	render() {
		return (
			<BrowserRouter>
				<div>
					<NavBar />
					<Switch>
						<Route exact path="/" component={Home} />
						<Route exact path="/blocks" component={Blocks} />
						<Route exact path="/block/:blockHeight" component={Block} />
						<Route exact path="/tx/:txHash" component={Tx} />
						<Route exact path="/query" component={Query} />
					</Switch>
				</div>
			</BrowserRouter>
		);
	}
}

export default App;
