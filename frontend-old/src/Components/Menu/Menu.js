import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions
} from '@floating-ui/react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { align } from 'Helpers/Props';
import getUniqueElememtId from 'Utilities/getUniqueElementId';
import styles from './Menu.css';

const placementMap = {
  [align.RIGHT]: 'bottom-end',
  [align.LEFT]: 'bottom-start'
};

function Menu(props) {
  const {
    className = styles.menu,
    children,
    alignMenu = align.LEFT,
    enforceMaxHeight = true
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [menuButtonId] = useState(getUniqueElememtId);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: placementMap[alignMenu],
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(0),
      flip({ padding: 0 }),
      shift({ padding: 0 }),
      size({
        apply({ availableHeight, elements }) {
          if (enforceMaxHeight) {
            Object.assign(elements.floating.style, {
              maxHeight: `${Math.max(availableHeight, 0)}px`
            });
          }
        }
      })
    ]
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss
  ]);

  const childrenArray = React.Children.toArray(children);

  const referenceProps = getReferenceProps();
  const buttonElement = childrenArray[0];

  return (
    <>
      <div
        id={menuButtonId}
        className={className}
      >
        <div ref={refs.setReference} {...referenceProps}>
          {buttonElement}
        </div>
      </div>

      {isOpen && (
        <FloatingPortal id="portal-root">
          {React.cloneElement(childrenArray[1], {
            ...getFloatingProps(),
            forwardedRef: refs.setFloating,
            style: floatingStyles,
            isOpen
          })}
        </FloatingPortal>
      )}
    </>
  );
}

Menu.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  alignMenu: PropTypes.oneOf([align.LEFT, align.RIGHT]),
  enforceMaxHeight: PropTypes.bool
};

export default Menu;
