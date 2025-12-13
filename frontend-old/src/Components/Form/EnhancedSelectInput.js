import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions
} from '@floating-ui/react';
import classNames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import Scroller from 'Components/Scroller/Scroller';
import { icons, scrollDirections, sizes } from 'Helpers/Props';
import { isMobile as isMobileUtil } from 'Utilities/browser';
import * as keyCodes from 'Utilities/Constants/keyCodes';
import getUniqueElememtId from 'Utilities/getUniqueElementId';
import HintedSelectInputOption from './HintedSelectInputOption';
import HintedSelectInputSelectedValue from './HintedSelectInputSelectedValue';
import TextInput from './TextInput';
import styles from './EnhancedSelectInput.css';

const MINIMUM_DISTANCE_FROM_EDGE = 10;

function isArrowKey(keyCode) {
  return keyCode === keyCodes.UP_ARROW || keyCode === keyCodes.DOWN_ARROW;
}

function getSelectedOption(selectedIndex, values) {
  return values[selectedIndex];
}

function findIndex(startingIndex, direction, values) {
  let indexToTest = startingIndex + direction;

  while (indexToTest !== startingIndex) {
    if (indexToTest < 0) {
      indexToTest = values.length - 1;
    } else if (indexToTest >= values.length) {
      indexToTest = 0;
    }

    if (getSelectedOption(indexToTest, values).isDisabled) {
      indexToTest = indexToTest + direction;
    } else {
      return indexToTest;
    }
  }
}

function previousIndex(selectedIndex, values) {
  return findIndex(selectedIndex, -1, values);
}

function nextIndex(selectedIndex, values) {
  return findIndex(selectedIndex, 1, values);
}

function getSelectedIndex(props) {
  const {
    value,
    values
  } = props;

  if (Array.isArray(value)) {
    return values.findIndex((v) => {
      return value.size && v.key === value[0];
    });
  }

  return values.findIndex((v) => {
    return v.key === value;
  });
}

function isSelectedItem(index, props) {
  const {
    value,
    values
  } = props;

  if (Array.isArray(value)) {
    return value.includes(values[index].key);
  }

  return values[index].key === value;
}

function getKey(selectedIndex, values) {
  return values[selectedIndex].key;
}

function EnhancedSelectInput(props) {
  const {
    className = styles.enhancedSelect,
    disabledClassName = styles.isDisabled,
    name,
    value,
    values,
    isDisabled = false,
    isEditable = false,
    isFetching = false,
    hasError,
    hasWarning,
    valueOptions = {},
    selectedValueOptions = {},
    selectedValueComponent: SelectedValueComponent = HintedSelectInputSelectedValue,
    optionComponent: OptionComponent = HintedSelectInputOption,
    onChange,
    onOpen
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(() => getSelectedIndex(props));
  const [isMobile] = useState(() => isMobileUtil());
  const [buttonId] = useState(getUniqueElememtId);
  const [optionsId] = useState(getUniqueElememtId);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      setIsOpen(open);
      if (open && onOpen) {
        onOpen();
      }
    },
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(0),
      flip({ padding: 0 }),
      size({
        apply({ availableHeight, rects, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
            maxHeight: `${Math.max(0, availableHeight - MINIMUM_DISTANCE_FROM_EDGE)}px`
          });
        }
      })
    ]
  });

  const click = useClick(context, { enabled: !isDisabled && !isMobile });
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss
  ]);

  useEffect(() => {
    if (!Array.isArray(value)) {
      setSelectedIndex(getSelectedIndex(props));
    }
  }, [value, values]);

  const onSelect = (val) => {
    if (Array.isArray(value)) {
      let newValue = null;
      const index = value.indexOf(val);
      if (index === -1) {
        newValue = values.map((v) => v.key).filter((v) => (v === val) || value.includes(v));
      } else {
        newValue = [...value];
        newValue.splice(index, 1);
      }
      onChange({
        name,
        value: newValue
      });
    } else {
      setIsOpen(false);
      onChange({
        name,
        value: val
      });
    }
  };

  const onBlur = () => {
    if (!isEditable) {
      const origIndex = getSelectedIndex(props);
      if (origIndex !== selectedIndex) {
        setSelectedIndex(origIndex);
      }
    }
  };

  const onKeyDown = (event) => {
    const keyCode = event.keyCode;

    if (!isOpen) {
      if (isArrowKey(keyCode)) {
        event.preventDefault();
        setIsOpen(true);
      }

      if (
        selectedIndex == null || selectedIndex === -1 ||
        getSelectedOption(selectedIndex, values).isDisabled
      ) {
        if (keyCode === keyCodes.UP_ARROW) {
          setSelectedIndex(previousIndex(0, values));
        } else if (keyCode === keyCodes.DOWN_ARROW) {
          setSelectedIndex(nextIndex(values.length - 1, values));
        }
      }
      return;
    }

    if (keyCode === keyCodes.UP_ARROW) {
      event.preventDefault();
      setSelectedIndex(previousIndex(selectedIndex, values));
    }

    if (keyCode === keyCodes.DOWN_ARROW) {
      event.preventDefault();
      setSelectedIndex(nextIndex(selectedIndex, values));
    }

    if (keyCode === keyCodes.ENTER) {
      event.preventDefault();
      setIsOpen(false);
      onSelect(getKey(selectedIndex, values));
    }

    if (keyCode === keyCodes.TAB) {
      setIsOpen(false);
      onSelect(getKey(selectedIndex, values));
    }

    if (keyCode === keyCodes.ESCAPE) {
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      setSelectedIndex(getSelectedIndex(props));
    }
  };

  // For mobile modal
  const onOptionsModalClose = () => {
    setIsOpen(false);
  };

  const handleMobilePress = () => {
    if (isMobile && !isDisabled) {
      setIsOpen(true);
    }
  };

  const isMultiSelect = Array.isArray(value);
  const selectedOption = getSelectedOption(selectedIndex, values);
  let selectedValueDisplay = value;

  if (!values.length) {
    selectedValueDisplay = isMultiSelect ? [] : '';
  }

  const referenceProps = getReferenceProps({
    onKeyDown: onKeyDown,
    onBlur: onBlur,
    onClick: handleMobilePress
  });

  return (
    <div>
      <div
        id={buttonId}
        ref={refs.setReference}
        {...referenceProps}
      >
        {
          isEditable ?
            <div
              className={styles.editableContainer}
            >
              <TextInput
                className={className}
                name={name}
                value={value}
                readOnly={isDisabled}
                hasError={hasError}
                hasWarning={hasWarning}
                onBlur={onBlur}
                onChange={onChange}
              />
              <Link
                className={classNames(
                  styles.dropdownArrowContainerEditable,
                  isDisabled ?
                    styles.dropdownArrowContainerDisabled :
                    styles.dropdownArrowContainer)
                }
                // onPress handled by referenceProps.onClick/useClick via bubbling or direct attachment?
                // Link's onPress might preventDefault.
                // Floating UI useClick attaches onClick.
                // If Link stops propagation, useClick might not fire.
                // Let's attach onClick directly to the container or Link.
                // Since we wrap the whole thing in referenceProps which has onClick, it should work.
              >
                {
                  isFetching ?
                    <LoadingIndicator
                      className={styles.loading}
                      size={20}
                    /> :
                    null
                }

                {
                  isFetching ?
                    null :
                    <Icon
                      name={icons.CARET_DOWN}
                    />
                }
              </Link>
            </div> :
            <Link
              className={classNames(
                className,
                hasError && styles.hasError,
                hasWarning && styles.hasWarning,
                isDisabled && disabledClassName
              )}
              isDisabled={isDisabled}
            >
              <SelectedValueComponent
                value={selectedValueDisplay}
                values={values}
                {...selectedValueOptions}
                {...(selectedOption ? (() => { const { key, ...rest } = selectedOption; return rest; })() : {})}
                isDisabled={isDisabled}
                isMultiSelect={isMultiSelect}
              >
                {selectedOption ? selectedOption.value : null}
              </SelectedValueComponent>

              <div
                className={isDisabled ?
                  styles.dropdownArrowContainerDisabled :
                  styles.dropdownArrowContainer
                }
              >

                {
                  isFetching ?
                    <LoadingIndicator
                      className={styles.loading}
                      size={20}
                    /> :
                    null
                }

                {
                  isFetching ?
                    null :
                    <Icon
                      name={icons.CARET_DOWN}
                    />
                }
              </div>
            </Link>
        }
      </div>

      {isOpen && !isMobile && (
        <FloatingPortal id="portal-root">
          <div
            ref={refs.setFloating}
            id={optionsId}
            className={styles.optionsContainer}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <Scroller
              className={styles.options}
              style={{
                maxHeight: floatingStyles.maxHeight
              }}
            >
              {
                values.map((v, index) => {
                  const hasParent = v.parentKey !== undefined;
                  const depth = hasParent ? 1 : 0;
                  const parentSelected = hasParent && value.includes(v.parentKey);
                  const { key, ...optionProps } = v;
                  return (
                    <OptionComponent
                      key={key}
                      id={key}
                      depth={depth}
                      isSelected={isSelectedItem(index, props)}
                      isDisabled={parentSelected}
                      isMultiSelect={isMultiSelect}
                      {...valueOptions}
                      {...optionProps}
                      isMobile={false}
                      onSelect={onSelect}
                    >
                      {v.value}
                    </OptionComponent>
                  );
                })
              }
            </Scroller>
          </div>
        </FloatingPortal>
      )}

      {isMobile ?
        <Modal
          className={styles.optionsModal}
          size={sizes.EXTRA_SMALL}
          isOpen={isOpen}
          onModalClose={onOptionsModalClose}
        >
          <ModalBody
            className={styles.optionsModalBody}
            innerClassName={styles.optionsInnerModalBody}
            scrollDirection={scrollDirections.NONE}
          >
            <Scroller className={styles.optionsModalScroller}>
              <div className={styles.mobileCloseButtonContainer}>
                <Link
                  className={styles.mobileCloseButton}
                  onPress={onOptionsModalClose}
                >
                  <Icon
                    name={icons.CLOSE}
                    size={18}
                  />
                </Link>
              </div>

              {
                values.map((v, index) => {
                  const hasParent = v.parentKey !== undefined;
                  const depth = hasParent ? 1 : 0;
                  const parentSelected = hasParent && value.includes(v.parentKey);
                  const { key, ...optionProps } = v;
                  return (
                    <OptionComponent
                      key={key}
                      id={key}
                      depth={depth}
                      isSelected={isSelectedItem(index, props)}
                      isMultiSelect={isMultiSelect}
                      isDisabled={parentSelected}
                      {...valueOptions}
                      {...optionProps}
                      isMobile={true}
                      onSelect={onSelect}
                    >
                      {v.value}
                    </OptionComponent>
                  );
                })
              }
            </Scroller>
          </ModalBody>
        </Modal> :
        null
      }
    </div>
  );
}

EnhancedSelectInput.propTypes = {
  className: PropTypes.string,
  disabledClassName: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.arrayOf(PropTypes.string), PropTypes.arrayOf(PropTypes.number)]),
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
  isDisabled: PropTypes.bool,
  isFetching: PropTypes.bool,
  isEditable: PropTypes.bool,
  hasError: PropTypes.bool,
  hasWarning: PropTypes.bool,
  valueOptions: PropTypes.object,
  selectedValueOptions: PropTypes.object,
  selectedValueComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  optionComponent: PropTypes.elementType,
  onOpen: PropTypes.func,
  onChange: PropTypes.func.isRequired
};

export default EnhancedSelectInput;
