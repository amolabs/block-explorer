import React, { Component } from 'react';

import '../styles/styles.css';
class NavBar extends Component {
	render() {
		return (
			<nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
				<NavBrand />
				<button
					className="navbar-toggler"
					type="button"
					data-toggle="collapse"
					data-target="#navbarCollapse"
				>
					<span className="navbar-toggler-icon" />
				</button>
				<div className="collapse navbar-collapse flex-md-column">
					<NavSearchBar />
					<NavMenu />
				</div>
			</nav>
		);
	}
}

const NavBrand = () => {
	return (
		<div className="navbar-brand" href="/">
			<img src={process.env.PUBLIC_URL + '/main.png'} width={30} />
			<h3 className="navbar-brand-name">AMO Block Explorer</h3>
		</div>
	);
};

const NavSearchBar = () => {
	return (
		<form className="form-inline ml-auto">
			<div className="input-group">
				<input
					type="text"
					className="form-control border-dark"
					placeholder="Search"
				/>
				<div className="input-group-append">
					<button className="btn btn-outline-secondary" type="button">
						<i className="fa fa-search" />
					</button>
				</div>
			</div>
		</form>
	);
};

const NavMenu = () => {
	return (
		<ul className="navbar-nav ml-auto small mb-2 mb-md-0">
			<NavItem name={'Home'} link={'/'} />
			<NavItem name={'Blocks'} link={'/'} />
			<NavItem name={'Txs'} link={'/'} />
		</ul>
	);
};

const NavItem = ({ name, link, active }) => {
	return (
		<li className={'nav-item ' + active ? 'active' : ''}>
			<a className="nav-link" href={link}>
				<h5>{name}</h5>
			</a>
		</li>
	);
};

export default NavBar;
