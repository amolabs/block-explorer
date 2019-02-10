import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PreviewHeader from './PreviewHeader';

class BlocksPreview extends Component {
	render() {
		return (
			<ul className="list-group">
				<PreviewHeader name="Blocks" to="/blocks" />
				{this.props.blocks.map((block, i) => {
					return (
						<BlockPreviewItem
							block={block}
							key={block.hash}
							onClick={this.onItemClick}
						/>
					);
				})}
			</ul>
		);
	}
	onItemClick = e => {
		this.props.history.push(`/block/${e}`);
	};
}

const BlockPreviewItem = ({ block, onClick }) => {
	return (
		<li
			className="list-group-item d-flex block-preview-item"
			onClick={() => onClick(block.hash)}
		>
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

export default withRouter(BlocksPreview);
