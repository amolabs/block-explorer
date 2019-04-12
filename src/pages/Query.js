import React, { Component } from 'react';
import { abciQuery } from '../rpc';
import Select from 'react-select';

const queries = {
	balance: ['address'],
	stake: ['address'],
	delegate: ['holder', 'delegator'],
	parcel: ['parcelID'],
	request: ['buyer', 'target'],
	usage: ['buyer', 'target'],
};

const queryErrorMsg = [
	'QueryCodeOK',
	'QueryCodeBadPath',
	'QueryCodeNoKey',
	'QueryCodeBadKey',
	'QueryCodeNoMatch',
];

class Query extends Component {
	state = {
		selected: null,
		result: null,
		inputs: {},
	};

	render() {
		return (
			<div className="container">
				<div className="row">
					<QueryInput
						selected={this.state.selected}
						onSelect={this.handleSelect}
						onInput={this.handleInput}
						onQuery={this.handleQuery}
					/>
				</div>
				<div className="row">
					{this.state.result && <Result result={this.state.result} />}
				</div>
			</div>
		);
	}

	handleInput = e => {
		let inputs = { ...this.state.inputs };
		inputs[e.target.name] = e.target.value;
		this.setState({ inputs: inputs });
	};
	handleSelect = selected => {
		this.setState({ selected: selected });
		this.setState({ inputs: {} });
	};
	handleQuery = e => {
		e.preventDefault();

		if (!this.state.selected) {
			alert('Please select query type');
			return;
		}

		// check if parameters are filled
		if (
			!queries[this.state.selected.value].every(q => this.state.inputs[q])
		) {
			alert('Please fill out all the parameters listed');
			return;
		}

		abciQuery(
			this.state.selected.value,
			this.state.inputs,
			result => {
				if ('code' in result)
					this.setState({
						result: {
							code: result.code,
							message: queryErrorMsg[result.code],
						},
					});
				else this.setState({ result: result });
			},
			error => {
				this.setState({
					result: {
						code: error.code,
						message: queryErrorMsg[error.code],
					},
				});
			}
		);
	};
}

const QueryInput = ({ selected, onSelect, onInput, onQuery }) => {
	let query = null;
	let form = null;

	if (selected) {
		query = selected.value;
		form = (
			<form className="d-flex flex-column mt-3" onSubmit={onQuery}>
				{queries[query].map(p => {
					return (
						<div className="input-group mb-3" key={p}>
							<div className="input-group-prepend">
								<span
									className="input-group-text"
									id="basic-addon1"
								>
									{p}
								</span>
							</div>
							<input
								type="text"
								name={p}
								className="form-control"
								onChange={onInput}
							/>
						</div>
					);
				})}

				<button type="submit" className="btn btn-secondary ml-auto">
					Submit
				</button>
			</form>
		);
	}

	return (
		<div className="col-md-6">
			<Select
				value={selected}
				onChange={onSelect}
				options={Object.keys(queries).map(q => {
					return { value: q, label: q };
				})}
			/>
			{form}
		</div>
	);
};

const Result = ({ result }) => {
	return (
		<div className="col-md-6 d-flex flex-column">
			<h4>Result</h4>

			<div>
				{Object.keys(result).map(r => (
					<p>
						{r} : {result[r]}
					</p>
				))}
			</div>
		</div>
	);
};

export default Query;
