import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'Helpers/withRouter';
import { useNavigationBlocker } from 'Helpers/useNavigationBlocker';
import { toggleAdvancedSettings } from 'Store/Actions/settingsActions';
import SettingsToolbar from './SettingsToolbar';

function mapStateToProps(state) {
  return {
    advancedSettings: state.settings.advancedSettings
  };
}

const mapDispatchToProps = {
  toggleAdvancedSettings
};

function SettingsToolbarConnector(props) {
  const {
    hasPendingChanges = false,
    toggleAdvancedSettings: dispatchToggleAdvancedSettings
  } = props;

  const blocker = useNavigationBlocker(hasPendingChanges);
  const hasPendingLocation = blocker.state === 'blocked';

  const onAdvancedSettingsPress = () => {
    dispatchToggleAdvancedSettings();
  };

  const onConfirmNavigation = () => {
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  };

  const onCancelNavigation = () => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  return (
    <SettingsToolbar
      {...props}
      hasPendingLocation={hasPendingLocation}
      onSavePress={props.onSavePress}
      onAdvancedSettingsPress={onAdvancedSettingsPress}
      onConfirmNavigation={onConfirmNavigation}
      onCancelNavigation={onCancelNavigation}
    />
  );
}

SettingsToolbarConnector.propTypes = {
  hasPendingChanges: PropTypes.bool,
  advancedSettings: PropTypes.bool,
  showSave: PropTypes.bool,
  isSaving: PropTypes.bool,
  additionalButtons: PropTypes.node,
  onSavePress: PropTypes.func,
  toggleAdvancedSettings: PropTypes.func.isRequired,
  bindShortcut: PropTypes.func
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SettingsToolbarConnector));
