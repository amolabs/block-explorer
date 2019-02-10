import React, { Component } from 'react';

class BlocksPreview extends Component {
	render() {
		return (
			<div>
				<ul className="list-group">
					<PreviewHeader name="Blocks" />
					{this.props.blocks.map(block => {
						return <BlockPreviewItem block={block} />;
					})}
				</ul>
			</div>
		);
	}
}

class TxPreview extends Component {
	render() {
		return (
			<div>
				<ul className="list-group">
					<PreviewHeader name="Transactions" />
					{this.props.txs.map(tx => {
						return <TxPreviewItem tx={tx} />;
					})}
				</ul>
			</div>
		);
	}
}

const PreviewHeader = ({ name, to }) => {
	return (
		<li className="list-group-item preview-header">
			<h4>{name}</h4>
			<button className="ml-auto">View All</button>
		</li>
	);
};

const BlockPreviewItem = ({ block }) => {
	return (
		<li className="list-group-item d-flex block-preview-item">
			<div className="block d-flex flex-column">
				<div>Block</div>
				<div># {block.height}</div>
			</div>
			<div className="block-info">
				<p>hash: {block.hash}</p>
				<p>mined by: {block.miner}</p>
				<p>{block.transaction} transactions</p>
			</div>
		</li>
	);
};

const TxPreviewItem = ({ tx }) => {
	return (
		<li className="list-group-item d-flex flex-column">
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

export { BlocksPreview, TxPreview };
