import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PreviewHeader from './PreviewHeader';

class TxsPreview extends Component {
	render() {
		return (
			<div>
				<ul className="list-group">
					<PreviewHeader name="Transactions" to="/txs" />
					{this.props.txs.map(tx => {
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
			className="list-group-item d-flex flex-column tx-preview-item"
			onClick={() => onClick(tx.hash)}
		>
			<div>
				<h6>{tx.type}</h6>
			</div>
			<div className="d-flex">
				<div className=" tx-info">
					<p>
						{tx.sender} <br />
						<i className="fa fa-arrow-right" /> {tx.param.to}
					</p>
				</div>
				<div className="ml-auto align-self-center">
					{tx.param.amount} AMO
				</div>
			</div>
		</li>
	);
};

export default withRouter(TxsPreview);
