import React, { useState } from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

interface ResetQualityDefinitionsModalContentProps {
  onResetQualityDefinitions: (resetDefinitionTitles: boolean) => void;
  isResettingQualityDefinitions: boolean;
  onModalClose: () => void;
}

function ResetQualityDefinitionsModalContent(props: ResetQualityDefinitionsModalContentProps) {
  const {
    onModalClose,
    isResettingQualityDefinitions,
    onResetQualityDefinitions
  } = props;

  const [resetDefinitionTitles, setResetDefinitionTitles] = useState(false);

  const handleResetDefinitionTitlesChange = ({ value }: { value: boolean }) => {
    setResetDefinitionTitles(value);
  };

  const handleResetQualityDefinitionsConfirmed = () => {
    onResetQualityDefinitions(resetDefinitionTitles);
    setResetDefinitionTitles(false);
  };

  return (
    <ModalContent
      onModalClose={onModalClose}
    >
      <ModalHeader>
        {translate('ResetQualityDefinitions')}
      </ModalHeader>

      <ModalBody>
        <div className="mb-5">
          {translate('ResetQualityDefinitionsMessageText')}
        </div>

        <FormGroup>
          <FormLabel>
            {translate('ResetTitles')}
          </FormLabel>

          <FormInputGroup
            type={inputTypes.CHECK}
            name="resetDefinitionTitles"
            value={resetDefinitionTitles}
            helpText={translate('ResetDefinitionTitlesHelpText')}
            onChange={handleResetDefinitionTitlesChange}
          />
        </FormGroup>

      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>
          {translate('Cancel')}
        </Button>

        <Button
          kind={kinds.DANGER}
          onPress={handleResetQualityDefinitionsConfirmed}
          isDisabled={isResettingQualityDefinitions}
        >
          {translate('Reset')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default ResetQualityDefinitionsModalContent;
