import React, { useEffect, useRef } from 'react';
import { Alert } from 'ComponentsV2/Feedback/Alert';
import { FormGroup, Input, Select } from 'ComponentsV2/Forms';
import { Button } from 'ComponentsV2/UI/Button';
import { Spinner } from 'ComponentsV2/UI/Spinner';
import { ModalContent, ModalFooter } from 'ComponentsV2/Feedback/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes, kinds } from 'Helpers/Props';
import { authenticationMethodOptions, authenticationRequiredOptions } from 'Settings/General/SecuritySettings';
import translate from 'Utilities/String/translate';

interface AuthenticationRequiredModalContentProps {
  isPopulated: boolean;
  error?: object;
  isSaving: boolean;
  saveError?: object;
  settings: {
    authenticationMethod: { value: string };
    authenticationRequired: { value: string };
    username: { value: string };
    password: { value: string };
    passwordConfirmation: { value: string };
  };
  onInputChange: (event: { name: string; value: unknown }) => void;
  onSavePress: () => void;
  dispatchFetchStatus: () => void;
}

function onModalClose() {
  // No-op
}

function AuthenticationRequiredModalContent(props: AuthenticationRequiredModalContentProps) {
  const {
    isPopulated,
    error,
    isSaving,
    settings,
    onInputChange,
    onSavePress,
    dispatchFetchStatus
  } = props;

  const {
    authenticationMethod,
    authenticationRequired,
    username,
    password,
    passwordConfirmation
  } = settings;

  const authenticationEnabled = authenticationMethod && authenticationMethod.value !== 'none';

  const didMount = useRef(false);

  useEffect(() => {
    if (!isSaving && didMount.current) {
      dispatchFetchStatus();
    }

    didMount.current = true;
  }, [isSaving, dispatchFetchStatus]);

  return (
    <ModalContent
      showCloseButton={false}
      onModalClose={onModalClose}
    >
      <ModalHeader>
        {translate('AuthenticationRequired')}
      </ModalHeader>

      <ModalBody>
        <Alert type="warning" className="mb-5">
          {translate('AuthenticationRequiredWarning')}
        </Alert>

        {
          isPopulated && !error ?
            <div>
              <FormGroup>
                <FormLabel>{translate('AuthenticationMethod')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.SELECT}
                  name="authenticationMethod"
                  values={authenticationMethodOptions}
                  helpText={translate('AuthenticationMethodHelpText')}
                  helpTextWarning={authenticationMethod.value === 'none' ? translate('AuthenticationMethodHelpTextWarning') : undefined}
                  helpLink="https://wiki.servarr.com/readarr/faq#forced-authentication"
                  onChange={onInputChange}
                  {...authenticationMethod}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('AuthenticationRequired')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.SELECT}
                  name="authenticationRequired"
                  values={authenticationRequiredOptions}
                  helpText={translate('AuthenticationRequiredHelpText')}
                  onChange={onInputChange}
                  {...authenticationRequired}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('Username')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.TEXT}
                  name="username"
                  onChange={onInputChange}
                  helpTextWarning={username?.value ? undefined : translate('AuthenticationRequiredUsernameHelpTextWarning')}
                  {...username}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('Password')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.PASSWORD}
                  name="password"
                  onChange={onInputChange}
                  helpTextWarning={password?.value ? undefined : translate('AuthenticationRequiredPasswordHelpTextWarning')}
                  {...password}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('PasswordConfirmation')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.PASSWORD}
                  name="passwordConfirmation"
                  onChange={onInputChange}
                  helpTextWarning={passwordConfirmation?.value ? undefined : translate('AuthenticationRequiredPasswordConfirmationHelpTextWarning')}
                  {...passwordConfirmation}
                />
              </FormGroup>
            </div> :
            null
        }

        {
          !isPopulated && !error ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : null
        }
      </ModalBody>

      <ModalFooter>
        <Button
          variant="primary"
          loading={isSaving}
          disabled={!authenticationEnabled}
          onClick={onSavePress}
        >
          {translate('Save')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default AuthenticationRequiredModalContent;
