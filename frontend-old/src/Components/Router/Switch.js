import PropTypes from 'prop-types';
import React from 'react';
import { Routes } from 'react-router-dom';

function Switch({ children }) {
  return <Routes>{children}</Routes>;
}

Switch.propTypes = {
  children: PropTypes.node.isRequired
};

export default Switch;
