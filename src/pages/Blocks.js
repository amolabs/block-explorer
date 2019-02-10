import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class Blocks extends Component {
	state = {
		blocks: [
			{
				height: 1,
				hash: '0e1341212351',
				miner: '0xd2123422',
				transaction: 10,
				timestamp: 'time',
			},
			{
				height: 2,
				hash: '0e1341212352',
				miner: '0xd2123422',
				transaction: 10,
				timestamp: 'time',
			},
			{
				height: 3,
				hash: '0e1341212353',
				miner: '0xd2123422',
				transaction: 10,
				timestamp: 'time',
			},
		],
	};

	render() {
		return (
			<div className="container-fluid">
				<table className="table table-striped">
					<BlockTableHeader />
					<tbody>
						{this.state.blocks.map(block => {
							return (
								<BlockTableItem
									block={block}
									onClick={this.onItemClick}
									key={block.hash}
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
	const CenteredTh = ({ name }) => {
		return <th style={{ textAlign: 'center' }}>{name}</th>;
	};

	return (
		<thead>
			<tr>
				<CenteredTh name="Height" />
				<CenteredTh name="Hash" />
				<CenteredTh name="Miner" />
				<CenteredTh name="Age" />
			</tr>
		</thead>
	);
};

const BlockTableItem = ({ block, onClick }) => {
	return (
		<tr onClick={() => onClick(block.hash)}>
			<td align="center">{block.height}</td>
			<td>{block.hash}</td>
			<td align="center">{block.miner}</td>
			<td align="center">{block.timestamp}</td>
		</tr>
	);
};

export default withRouter(Blocks);
