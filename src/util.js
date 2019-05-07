// vim: set noexpandtab ts=2 sw=2 :
import React from 'react';
import { Link } from 'react-router-dom';

export const TextInput = ({desc, name, value, onChange, onSubmit}) => {
	return (
		<div className="container">
			<form className="d-flex flex-column mt-3" onSubmit={onSubmit}>
				<div className="input-group mb-3">
					<span className="input-group-text" id="basic-addon1">{desc}</span>
					<input type="text" className="form-control"
						name={name} value={value} onChange={onChange}/>
					<button type="submit" className="btn btn-secondary ml-auto">
						Query
					</button>
				</div>
			</form>
		</div>
	);
};

export const KeyValueRow = ({ k, v }) => {
	return ( <p> {k} : {v} </p> );
};

export const blockLink = (height) => {
	return ( <Link to={"/block/" + height}>{height}</Link>);
};

export const txLink = (hash) => {
	return ( <Link to={"/tx/" + hash}>{hash}</Link>);
};

export const accountLink = (address) => {
	return ( <Link to={"/account/" + address}>{address}</Link> );
};

export const validatorLink = (address) => {
	return ( <Link to={"/validator/" + address}>{address}</Link>);
};

export const parcelLink = (parcelID) => {
	return ( <Link to={"/parcel/" + parcelID}>{parcelID}</Link>);
};

