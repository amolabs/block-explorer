import React, { Component } from 'react';

class Transactions extends Component {
	state = {
		txs: [
			{
				hash: '0x12a231',
				from: '0x0d2212341234',
				to: '0x0d2213241234',
				amount: 0.1,
				timestamp: 'time',
			},
			{
				hash: '0x12a232',
				from: '0x0d2212341234',
				to: '0x0d2213241234',
				amount: 0.2,
				timestamp: 'time',
			},
			{
				hash: '0x12a233',
				from: '0x0d2212341234',
				to: '0x0d2213241234',
				amount: 0.3,
				timestamp: 'time',
			},
		],
	};

	render() {
		return (
			<div className="container-fluid">
				<table className="table table-striped">
					<TxTableHeader />
					<tbody>
						{this.state.txs.map(tx => {
							return (
								<TxTableItem
									tx={tx}
									key={tx.hash}
									onClick={this.onItemClick}
								/>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}

	onItemClick = e => {
		this.props.history.push(`/tx/${e}`);
	};
}

const TxTableHeader = () => {
	return (
		<thead>
			<tr>
				<th>Hash</th>
				<th>From</th>
				<th>To</th>
				<th style={{ 'text-align': 'center' }}>Amount</th>
				<th style={{ 'text-align': 'center' }}>Age</th>
			</tr>
		</thead>
	);
};

const TxTableItem = ({ tx, onClick }) => {
	return (
		<tr onClick={() => onClick(tx.hash)}>
			<td>{tx.hash}</td>
			<td>{tx.from}</td>
			<td>{tx.to}</td>
			<td align="center">{tx.amount}</td>
			<td align="center">{tx.timestamp}</td>
		</tr>
	);
};

export default Transactions;
