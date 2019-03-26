import React, { Component } from 'react';
import { getTxByHash } from '../rpc';

class Tx extends Component {
	state = {
		tx: {
			hash: null,
			sender: null,
			param: null,
		},
	};

	fetchTx = () => {
		getTxByHash(this.props.match.params.txHash, result => {
			console.log(result);
			this.setState({ tx: result });
		});
	};

	componentDidMount() {
		this.fetchTx();
	}

	render() {
		return (
			<div className="container">
				<TxInfo name="Hash" content={this.state.tx.hash} />
				<TxInfo name="Sender" content={this.state.tx.sender} />
				{this.state.tx.param &&
					Object.keys(this.state.tx.param).map(key => (
						<TxInfo name={key} content={this.state.tx.param[key]} />
					))}
			</div>
		);
	}
}

const TxInfo = ({ name, content }) => {
	return (
		<p>
			{name} : {content}
		</p>
	);
};

export default Tx;
