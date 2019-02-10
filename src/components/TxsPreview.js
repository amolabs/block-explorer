import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PreviewHeader from './PreviewHeader';

class TxsPreview extends Component {
	render() {
		return (
			<div>
				<ul className="list-group">
					<PreviewHeader name="Transactions" to="/txs" />
					{this.props.txs.map((tx, i) => {
						return (
							<TxsPreviewItem
								tx={tx}
								key={tx.hash}
								onClick={this.onItemClick}
							/>
						);
					})}
				</ul>
			</div>
		);
	}

	onItemClick = e => {
		this.props.history.push(`/tx/${e}`);
	};
}

const TxsPreviewItem = ({ tx, onClick }) => {
	return (
		<li
			className="list-group-item d-flex flex-column"
			onClick={() => onClick(tx.hash)}
		>
			<div className="d-flex">
				<span>
					<h5>Tx {tx.hash}</h5>
				</span>
				<span className="ml-auto">{tx.timestamp}</span>
			</div>
			<div className="d-flex">
				<span>
					{tx.from} <i className="fa fa-arrow-right" /> {tx.to}
				</span>
				<span className="ml-auto">{tx.amount} AMO</span>
			</div>
		</li>
	);
};

export default withRouter(TxsPreview);
