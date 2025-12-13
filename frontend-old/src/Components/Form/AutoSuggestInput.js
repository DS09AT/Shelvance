import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  size,
  useFloating
} from '@floating-ui/react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import Autosuggest from 'react-autosuggest';
import styles from './AutoSuggestInput.css';

function AutoSuggestInput(props) {
  const {
    forwardedRef,
    className = styles.input,
    inputContainerClassName = styles.inputContainer,
    name,
    value,
    placeholder,
    suggestions,
    hasError,
    hasWarning,
    enforceMaxHeight = true,
    minHeight = 50,
    maxHeight = 200,
    getSuggestionValue,
    renderInputComponent: CustomInputComponent,
    renderSuggestion,
    onInputChange,
    onInputKeyDown,
    onInputFocus,
    onInputBlur,
    onSuggestionsFetchRequested,
    onSuggestionsClearRequested,
    onSuggestionSelected,
    onChange,
    ...otherProps
  } = props;

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(0),
      flip({ padding: minHeight }),
      size({
        apply({ availableHeight, elements, rects }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: enforceMaxHeight ? `${availableHeight}px` : ''
          });
        }
      })
    ]
  });

  const handleInputChange = (event, { newValue }) => {
    onChange({
      name,
      value: newValue
    });
  };

  const handleInputKeyDown = (event) => {
    if (
      event.key === 'Tab' &&
      suggestions.length &&
      suggestions[0] !== value
    ) {
      event.preventDefault();

      if (value) {
        onChange({
          name,
          value: suggestions[0]
        });
      }
    }
  };

  const renderInputComponent = (inputProps) => {
    const { ref, key, ...rest } = inputProps;
    
    // Combine refs: Autosuggest's ref and Floating UI's setReference
    const combinedRef = (node) => {
      refs.setReference(node);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    if (CustomInputComponent) {
      return CustomInputComponent(rest, combinedRef);
    }

    return (
      <div ref={combinedRef}>
        <input {...rest} />
      </div>
    );
  };

  const renderSuggestionsContainer = ({ containerProps, children }) => {
    if (!children) {
      return null;
    }

    // Extract key from containerProps to avoid React 19 warning
    const { key, ...restContainerProps } = containerProps;

    return (
      <FloatingPortal id="portal-root">
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className={children ? styles.suggestionsContainerOpen : undefined}
        >
          <div
            key={key}
            {...restContainerProps}
            style={{
              maxHeight: floatingStyles.maxHeight || maxHeight
            }}
          >
            {children}
          </div>
        </div>
      </FloatingPortal>
    );
  };

  const inputProps = {
    className: classNames(
      className,
      hasError && styles.hasError,
      hasWarning && styles.hasWarning
    ),
    name,
    value,
    placeholder,
    autoComplete: 'off',
    spellCheck: false,
    onChange: onInputChange || handleInputChange,
    onKeyDown: onInputKeyDown || handleInputKeyDown,
    onFocus: onInputFocus,
    onBlur: onInputBlur
  };

  const theme = {
    container: inputContainerClassName,
    containerOpen: styles.suggestionsContainerOpen,
    suggestionsContainer: styles.suggestionsContainer,
    suggestionsList: styles.suggestionsList,
    suggestion: styles.suggestion,
    suggestionHighlighted: styles.suggestionHighlighted
  };

  return (
    <Autosuggest
      {...otherProps}
      ref={forwardedRef}
      id={name}
      inputProps={inputProps}
      theme={theme}
      suggestions={suggestions}
      getSuggestionValue={getSuggestionValue}
      renderInputComponent={renderInputComponent}
      renderSuggestionsContainer={renderSuggestionsContainer}
      renderSuggestion={renderSuggestion}
      onSuggestionSelected={onSuggestionSelected}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
    />
  );
}

AutoSuggestInput.propTypes = {
  forwardedRef: PropTypes.func,
  className: PropTypes.string,
  inputContainerClassName: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  placeholder: PropTypes.string,
  suggestions: PropTypes.array.isRequired,
  hasError: PropTypes.bool,
  hasWarning: PropTypes.bool,
  enforceMaxHeight: PropTypes.bool,
  minHeight: PropTypes.number,
  maxHeight: PropTypes.number,
  getSuggestionValue: PropTypes.func.isRequired,
  renderInputComponent: PropTypes.elementType,
  renderSuggestion: PropTypes.func.isRequired,
  onInputChange: PropTypes.func,
  onInputKeyDown: PropTypes.func,
  onInputFocus: PropTypes.func,
  onInputBlur: PropTypes.func.isRequired,
  onSuggestionsFetchRequested: PropTypes.func.isRequired,
  onSuggestionsClearRequested: PropTypes.func.isRequired,
  onSuggestionSelected: PropTypes.func,
  onChange: PropTypes.func.isRequired
};

export default AutoSuggestInput;
