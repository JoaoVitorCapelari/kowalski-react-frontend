import React from 'react';
import styled from 'styled-components';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import FaAngleDown from 'react-icons/lib/fa/angle-down';
import SaturnoLogo from 'images/saturno-logo.svg';
import NavBar from './NavBar';
import messages from './messages';
import { fromJS } from 'immutable';
const jwtDecode = require('jwt-decode');

const AppNameWrapper = styled.span`
  font-size: 1.5rem;
`;

const NavBarMenuWrapper = styled.span`
  margin-left: 2rem;
`;

const NavMenu = styled.a`
  color: inherit;
`;

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dropDownExpanded: false };
    this.expandUserDropdown = this.expandUserDropdown.bind(this);
    this.collapseUserDropdown = this.collapseUserDropdown.bind(this);
  }

  expandUserDropdown() {
    this.setState({ dropDownExpanded: true });
  }

  collapseUserDropdown() {
    this.setState({ dropDownExpanded: false });
  }

  render() {
    const { children, onTimesheetClicked, onProjectsClicked, onPeopleClicked, onLogoutClicked } = this.props;

    return (
      <div className="kowalski-react-basic-container-vertical">
        <NavBar aria-label="main navigation" className="navbar">
          <div className="navbar-start">
            <AppNameWrapper className="navbar-item">
              <img src={SaturnoLogo} alt="react-boilerplate - Logo" />
            </AppNameWrapper>
          </div>
          <div className="navbar-end">
            <span className="navbar-item">
              <NavMenu onClick={onTimesheetClicked}><FormattedMessage {...messages.timesheet} /></NavMenu>
            </span>
            <span className="navbar-item">
              <NavMenu onClick={onProjectsClicked}><FormattedMessage {...messages.projects} /></NavMenu>
            </span>
            <span className="navbar-item">
              <NavMenu onClick={onPeopleClicked}><FormattedMessage {...messages.people} /></NavMenu>
            </span>
            <NavBarMenuWrapper className="navbar-item">
              <UserDropdown
                expanded={this.state.dropDownExpanded}
                handleMenuExpansion={this.expandUserDropdown}
                handleMenuCollapse={this.collapseUserDropdown}
                onLogoutClicked={this.props.onLogoutClicked}
              />
            </NavBarMenuWrapper>
          </div>
        </NavBar>
        { children }
      </div>
    );
  }
}

const UserDropdown = (props) => {
  const authToken = localStorage.getItem('authToken');
  let username = null;
  if (authToken) {
    const decodedJwt = jwtDecode(authToken);
    username = decodedJwt.sub;
  } else {
    username = 'Undefined';
  }

  return (
    <div className={`dropdown ${props.expanded ? 'is-active' : ''}`}
      onMouseEnter={props.handleMenuExpansion}
      onMouseLeave={props.handleMenuCollapse}
    >
      <div className="dropdown-trigger">
        <button
          className="button"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          style={{ border: 'none' }}
        >
          <span>{ username }</span>
          <span className="icon is-small">
            <FaAngleDown />
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          <a href="#" className="dropdown-item" onClick={props.onLogoutClicked}>
            Logout
          </a>
        </div>
      </div>
    </div>
  );
};

Header.propTypes = {
  children: PropTypes.object,
  onTimesheetClicked: PropTypes.func.isRequired,
  onProjectsClicked: PropTypes.func.isRequired,
  onPeopleClicked: PropTypes.func.isRequired,
  onLogoutClicked: PropTypes.func.isRequired,
};

export default injectIntl(Header);
