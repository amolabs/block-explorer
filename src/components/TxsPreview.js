import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PreviewHeader from './PreviewHeader';

class TxsPreview extends Component {
	render() {
		return (
			<div>
				<ul className="list-group">
					<PreviewHeader name="Recent Transactions" to="/txs" />
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
			<div className="row tx-info">
				<p className="col-2"><b>{tx.type}</b></p>
				<p className="col-10"><font color="grey"><i>hash</i>: {tx.hash}</font></p>
			</div>
			<TxDetail name="sender" content={tx.sender} />
			{Object.keys(tx.param).map(key => {
				return <TxDetail name={key} content={tx.param[key]} />;
			})}
		</li>
	);
};
const TxDetail = ({ name, content }) => {
	return (
		<div className="row tx-info">
			<p className="col-2">{name}</p>
			<p className="col-10">{content}</p>
		</div>
	);
};

export default withRouter(TxsPreview);
