import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Alert from 'Components/Alert';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import ProviderFieldFormGroup from 'Components/Form/ProviderFieldFormGroup';
import Button from 'Components/Link/Button';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './EditMetadataProviderModalContent.css';

class EditMetadataProviderModalContent extends Component {

  //
  // Lifecycle

  componentDidMount() {
    if (this.props.isFetching) {
      return;
    }

    if (!this.props.isFetching && !this.props.isPopulated) {
      this.props.onModalClose();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isSaving && !this.props.isSaving && !this.props.saveError) {
      this.props.onModalClose();
    }
  }

  //
  // Listeners

  onInputChange = ({ name, value }) => {
    this.props.setMetadataProviderValue({ name, value });
  };

  onFieldChange = ({ name, value }) => {
    this.props.setMetadataProviderFieldValue({ name, value });
  };

  onSavePress = () => {
    this.props.saveMetadataProvider({ id: this.props.id });
  };

  onTestPress = () => {
    this.props.testMetadataProvider({ id: this.props.id });
  };

  onDeleteMetadataProviderPress = () => {
    this.props.onDeleteMetadataProviderPress(this.props.id);
  };

  //
  // Render

  render() {
    const {
      advancedSettings,
      isFetching,
      isPopulated,
      error,
      isSaving,
      isTesting,
      saveError,
      item,
      onModalClose,
      onDeleteMetadataProviderPress,
      ...otherProps
    } = this.props;

    if (isFetching) {
      return (
        <ModalContent onModalClose={onModalClose}>
          <ModalHeader>
            {translate('EditMetadataProvider')}
          </ModalHeader>

          <ModalBody>
            <LoadingIndicator />
          </ModalBody>
        </ModalContent>
      );
    }

    if (!isPopulated) {
      return null;
    }

    if (error) {
      return (
        <ModalContent onModalClose={onModalClose}>
          <ModalHeader>
            {translate('EditMetadataProvider')} - {item.name}
          </ModalHeader>

          <ModalBody>
            <Alert kind={kinds.DANGER}>
              {translate('UnableToLoadMetadataProvider')}
            </Alert>
          </ModalBody>

          <ModalFooter>
            <Button
              onPress={onModalClose}
            >
              {translate('Close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      );
    }

    const {
      id,
      implementationName,
      name,
      enableAuthorSearch,
      enableBookSearch,
      priority,
      fields,
      message
    } = item;

    return (
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>
          {`${id ? translate('Edit') : translate('Add')} ${translate('MetadataProvider')} - ${implementationName}`}
        </ModalHeader>

        <ModalBody>
          <Form {...otherProps}>
            {
              message &&
                <Alert kind={message.value.type}>
                  {message.value.message}
                </Alert>
            }

            <FormGroup>
              <FormLabel>{translate('Name')}</FormLabel>

              <FormInputGroup
                type={inputTypes.TEXT}
                name="name"
                {...name}
                onChange={this.onInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('Priority')}</FormLabel>

              <FormInputGroup
                type={inputTypes.NUMBER}
                name="priority"
                helpText={translate('MetadataProviderPriorityHelpText')}
                min={1}
                max={100}
                {...priority}
                onChange={this.onInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('EnableAuthorSearch')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="enableAuthorSearch"
                helpText={translate('EnableAuthorSearchHelpText')}
                {...enableAuthorSearch}
                onChange={this.onInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('EnableBookSearch')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="enableBookSearch"
                helpText={translate('EnableBookSearchHelpText')}
                {...enableBookSearch}
                onChange={this.onInputChange}
              />
            </FormGroup>

            {
              fields && fields.some((x) => x.label === 'Base Url') &&
                <Alert kind={kinds.INFO}>
                  {translate('MetadataProviderBaseUrlHelpText')}
                </Alert>
            }

            {
              fields && fields.map((field) => {
                return (
                  <ProviderFieldFormGroup
                    key={field.name}
                    advancedSettings={advancedSettings}
                    provider="metadataProvider"
                    providerData={item}
                    section="settings.metadataProviders"
                    {...field}
                    onChange={this.onFieldChange}
                  />
                );
              })
            }

          </Form>
        </ModalBody>

        <ModalFooter>
          {
            id &&
              <Button
                className={styles.deleteButton}
                kind={kinds.DANGER}
                onPress={this.onDeleteMetadataProviderPress}
              >
                {translate('Delete')}
              </Button>
          }

          <SpinnerErrorButton
            isSpinning={isTesting}
            error={saveError}
            onPress={this.onTestPress}
          >
            {translate('Test')}
          </SpinnerErrorButton>

          <Button
            onPress={onModalClose}
          >
            {translate('Cancel')}
          </Button>

          <SpinnerErrorButton
            isSpinning={isSaving}
            error={saveError}
            onPress={this.onSavePress}
          >
            {translate('Save')}
          </SpinnerErrorButton>
        </ModalFooter>
      </ModalContent>
    );
  }
}

EditMetadataProviderModalContent.propTypes = {
  advancedSettings: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  error: PropTypes.object,
  isSaving: PropTypes.bool.isRequired,
  isTesting: PropTypes.bool.isRequired,
  saveError: PropTypes.object,
  item: PropTypes.object.isRequired,
  setMetadataProviderValue: PropTypes.func.isRequired,
  setMetadataProviderFieldValue: PropTypes.func.isRequired,
  saveMetadataProvider: PropTypes.func.isRequired,
  testMetadataProvider: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired,
  onDeleteMetadataProviderPress: PropTypes.func
};

export default EditMetadataProviderModalContent;
