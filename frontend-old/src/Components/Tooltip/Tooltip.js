import {
  arrow,
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole
} from '@floating-ui/react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { kinds, tooltipPositions } from 'Helpers/Props';
import dimensions from 'Styles/Variables/dimensions';
import { isMobile as isMobileUtil } from 'Utilities/browser';
import styles from './Tooltip.css';

let maxTooltipWidth = null;

function getMaxWidth() {
  const windowWidth = window.innerWidth;

  if (windowWidth >= parseInt(dimensions.breakpointLarge)) {
    maxTooltipWidth = 800;
  } else if (windowWidth >= parseInt(dimensions.breakpointMedium)) {
    maxTooltipWidth = 650;
  } else if (windowWidth >= parseInt(dimensions.breakpointSmall)) {
    maxTooltipWidth = 500;
  } else {
    maxTooltipWidth = 450;
  }

  return maxTooltipWidth;
}

function Tooltip(props) {
  const {
    className,
    bodyClassName = styles.body,
    anchor,
    tooltip,
    kind = kinds.DEFAULT,
    position = tooltipPositions.TOP,
    canFlip = false
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const { refs, floatingStyles, context, placement, middlewareData } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: position,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      canFlip && flip(),
      shift(),
      size({
        apply({ availableWidth, availableHeight, elements }) {
          const currentMaxWidth = maxTooltipWidth || getMaxWidth();
          const finalMaxWidth = Math.min(currentMaxWidth, availableWidth - 20);

          Object.assign(elements.floating.style, {
            maxWidth: `${finalMaxWidth}px`,
            maxHeight: `${availableHeight - 20}px`
          });
        }
      }),
      arrow({
        element: arrowRef
      })
    ]
  });

  const hover = useHover(context, {
    enabled: !isMobileUtil(),
    delay: { open: 0, close: 100 },
    move: false
  });
  const click = useClick(context, {
    enabled: isMobileUtil()
  });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    click,
    dismiss,
    role
  ]);

  const popperPlacement = placement ? placement.split('-')[0] : position;
  const vertical = popperPlacement === 'top' || popperPlacement === 'bottom';

  // Calculate arrow position
  const { x: arrowX, y: arrowY } = middlewareData.arrow || {};
  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right'
  }[popperPlacement];

  const arrowStyle = {
    left: arrowX != null ? `${arrowX}px` : '',
    top: arrowY != null ? `${arrowY}px` : '',
    right: '',
    bottom: '',
    [staticSide]: '-4px'
  };

  return (
    <>
      <span
        ref={refs.setReference}
        className={className}
        {...getReferenceProps()}
      >
        {anchor}
      </span>
      {isOpen && (
        <FloatingPortal id="portal-root">
          <div
            ref={refs.setFloating}
            className={classNames(
              styles.tooltipContainer,
              vertical ? styles.verticalContainer : styles.horizontalContainer
            )}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <div
              ref={arrowRef}
              className={classNames(
                styles.arrow,
                styles[kind],
                styles[popperPlacement]
              )}
              style={arrowStyle}
            />
            
            <div
              className={classNames(
                styles.tooltip,
                styles[kind]
              )}
            >
              <div className={bodyClassName}>
                {tooltip}
              </div>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

Tooltip.propTypes = {
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  anchor: PropTypes.node.isRequired,
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  kind: PropTypes.oneOf([kinds.DEFAULT, kinds.INVERSE]),
  position: PropTypes.oneOf(tooltipPositions.all),
  canFlip: PropTypes.bool
};

export default Tooltip;
