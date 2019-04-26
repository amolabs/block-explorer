// vim: set noexpandtab ts=2 sw=2 :
import React from 'react';

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

export const accountLink = (address) => {
	return ( <a href={"/account/" + address}>{address}</a>);
};

export const blockLink = (height) => {
	return ( <a href={"/block/" + height}>{height}</a>);
};

export const txLink = (hash) => {
	return ( <a href={"/tx/" + hash}>{hash}</a>);
};
