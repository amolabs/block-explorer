import React, { Component } from 'react';

import '../styles/styles.css';
import { Link, withRouter } from 'react-router-dom';
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
					<NavMenu pathName={this.props.location.pathname} />
				</div>
			</nav>
		);
	}
}

const NavBrand = () => {
	return (
		<Link to="/" className="navbar-brand">
			<img
				src={process.env.PUBLIC_URL + '/main.png'}
				width={30}
				alt={'AMO'}
			/>
			<h3 className="navbar-brand-name">AMO Block Explorer</h3>
		</Link>
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

const NavMenu = ({ pathName }) => {
	return (
		<ul className="navbar-nav ml-auto small mb-2 mb-md-0">
			<NavItem name={'Home'} link={'/'} active={pathName === '/'} />
			<NavItem
				name={'Blocks'}
				link={'/blocks'}
				active={pathName === '/blocks'}
			/>
			<NavItem name={'Txs'} link={'/txs'} active={pathName === '/txs'} />
		</ul>
	);
};

const NavItem = ({ name, link, active }) => {
	return (
		<li className={'nav-item' + (active ? ' active' : '')}>
			<Link className="nav-link" to={link}>
				<h5 className="nav-item-text">{name}</h5>
			</Link>
		</li>
	);
};

export default withRouter(NavBar);
