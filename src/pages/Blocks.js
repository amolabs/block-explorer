import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { getBlocks } from '../rpc';
import moment from 'moment';

class Blocks extends Component {
	state = {
		blocks: [],
	};

	fetchBlocks = () => {
		getBlocks(this.props.latestHeight, blocksPerPages, result => {
			this.setState({ blocks: result });
		});
	};

	componentDidMount() {
		// fetch blocks on component mount (for router)
		if (this.props.latestHeight != null) this.fetchBlocks();
	}

	componentDidUpdate(prevProps) {
		// fetch blocks if latest height changed
		if (this.props.latestHeight !== prevProps.latestHeight) {
			this.fetchBlocks();
		}
	}

	render() {
		return (
			<div className="container-fluid">
				<table className="table table-striped block-table">
					<BlockTableHeader />
					<tbody>
						{this.state.blocks.map(block => {
							return (
								<BlockTableItem
									block={block}
									onClick={this.onItemClick}
									key={block.height}
								/>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}

	onItemClick = e => {
		this.props.history.push(`/block/${e}`);
	};
}

const BlockTableHeader = () => {
	const HeaderItem = ({ name, col }) => {
		return <th className={`header-item col-md-${col}`}>{name}</th>;
	};

	return (
		<thead>
			<tr>
				<HeaderItem name="Height" col={1} />
				<HeaderItem name="Hash" col={4} />
				<HeaderItem name="Miner" col={4} />
				<HeaderItem name="Tx" col={1} />
				<HeaderItem name="Age" col={2} />
			</tr>
		</thead>
	);
};

const BlockTableItem = ({ block, onClick }) => {
	const RowItem = ({ content, col }) => {
		return <td className={`row-item col-md-${col}`}>{content}</td>;
	};
	return (
		<tr onClick={() => onClick(block.height)}>
			<RowItem content={block.height} col={1} />
			<RowItem content={block.hash} col={4} />
			<RowItem content={block.miner} col={4} />
			<RowItem content={block.numTx} col={1} />
			<RowItem content={moment(block.timestamp).fromNow(true)} col={2} />
		</tr>
	);
};

export default withRouter(Blocks);
