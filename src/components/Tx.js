// vim: set noexpandtab ts=2 sw=2 :
import React from 'react';
import { accountLink, txLink, parcelLink } from '../util';

export const TxBody = ({tx}) => {
	switch (tx.type) {
		case 'transfer':
			return (<TxTransfer txBody={tx.param} />);
		case 'stake':
			return (<TxStake txBody={tx.param} />);
		case 'withdraw':
			return (<TxWithdraw txBody={tx.param} />);
		case 'delegate':
			return (<TxDelegate txBody={tx.param} />);
		case 'retract':
			return (<TxRetract txBody={tx.param} />);
		case 'register':
			return (<TxRegister txBody={tx.param} />);
		case 'request':
			return (<TxRequest txBody={tx.param} />);
		case 'grant':
			return (<TxGrant txBody={tx.param} />);
		default:
			return (<div>Unknown transaction type</div>);
	}
};

const TxTransfer = ({txBody}) => {
	return (
		<div>
			<div>Recipient: {accountLink(txBody.to)}</div>
			<div>Amount: {txBody.amount}</div>
		</div>
	);
}

const TxStake = ({txBody}) => {
	// TODO: use validator pubkey link
	return (
		<div>
			<div>Validator pubkey: {txBody.validator}</div>
			<div>Amount: {txBody.amount}</div>
		</div>
	);
}

const TxWithdraw = ({txBody}) => {
	// TODO: use validator pubkey link
	return (
		<div>
			<div>Amount: {txBody.amount}</div>
		</div>
	);
}

const TxDelegate = ({txBody}) => {
	return (
		<div>
			<div>Delegator: {accountLink(txBody.to)}</div>
			<div>Amount: {txBody.amount}</div>
		</div>
	);
}

const TxRetract = ({txBody}) => {
	return (
		<div>
			<div>Amount: {txBody.amount}</div>
		</div>
	);
}

const TxRegister = ({txBody}) => {
	return (
		<div>
			<div>Parcel: {parcelLink(txBody.target)}</div>
			<div>Key Custody: {txBody.custody}</div>
		</div>
	);
}

const TxRequest = ({txBody}) => {
	return (
		<div>
			<div>Parcel: {parcelLink(txBody.target)}</div>
			<div>Payment: {txBody.payment}</div>
		</div>
	);
}

const TxGrant = ({txBody}) => {
	return (
		<div>
			<div>Parcel: {parcelLink(txBody.target)}</div>
			<div>Grantee: {accountLink(txBody.grantee)}</div>
			<div>Key Custody: {txBody.custody}</div>
		</div>
	);
}

export const TxBriefList = ({txs}) => {
	if (!txs) txs = [];
	return (
		<ul>
			{ txs.map((tx) => {
				return (<TxBriefItem key={tx.hash} tx={tx}/>);
			}) }
		</ul>
	);
};

const TxBriefItem = ({tx}) => {
	return (
		<li key={tx.hash}>
			<div>TxHash: {txLink(tx.hash)}</div>
			<div>Sender: {accountLink(tx.sender)}</div>
			<div>Type: {tx.type}</div>
			<TxBody tx={tx} />
		</li>
	);
};

