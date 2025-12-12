import PropTypes from 'prop-types';
import React from 'react';
import styles from './VirtualTableRowCell.css';

const VirtualTableRowCell = React.forwardRef(function VirtualTableRowCell(props, ref) {
  const {
    className = styles.cell,
    children
  } = props;

  return (
    <div
      ref={ref}
      className={className}
    >
      {children}
    </div>
  );
});

VirtualTableRowCell.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};

export default VirtualTableRowCell;
