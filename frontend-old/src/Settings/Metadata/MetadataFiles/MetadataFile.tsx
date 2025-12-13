import React, { useState } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import { kinds } from 'Helpers/Props';
import EditMetadataFileModalConnector from './EditMetadataFileModalConnector';

interface Field {
  label: string;
  value: boolean;
  section: string;
}

interface MetadataFileProps {
  id: number;
  name: string;
  enable: boolean;
  fields: Field[];
}

function MetadataFile(props: MetadataFileProps) {
  const {
    id,
    name,
    enable,
    fields
  } = props;

  const [isEditMetadataModalOpen, setIsEditMetadataModalOpen] = useState(false);

  const metadataFields: Field[] = [];
  const imageFields: Field[] = [];

  fields.forEach((field) => {
    if (field.section === 'metadata') {
      metadataFields.push(field);
    } else {
      imageFields.push(field);
    }
  });

  const handleEditMetadataPress = () => {
    setIsEditMetadataModalOpen(true);
  };

  const handleEditMetadataModalClose = () => {
    setIsEditMetadataModalOpen(false);
  };

  return (
    <Card
      className="w-[290px]"
      overlayContent={true}
      onPress={handleEditMetadataPress}
    >
      <div className="mb-5 text-2xl font-light">
        {name}
      </div>

      <div>
        {
          enable ?
            <Label kind={kinds.SUCCESS}>
              Enabled
            </Label> :
            <Label
              kind={kinds.DISABLED}
              outline={true}
            >
              Disabled
            </Label>
        }
      </div>

      {
        enable && !!metadataFields.length &&
          <div>
            <div className="mt-2.5">
              Metadata
            </div>

            {
              metadataFields.map((field) => {
                if (!field.value) {
                  return null;
                }

                return (
                  <Label
                    key={field.label}
                    kind={kinds.SUCCESS}
                  >
                    {field.label}
                  </Label>
                );
              })
            }
          </div>
      }

      {
        enable && !!imageFields.length &&
          <div>
            <div className="mt-2.5">
              Images
            </div>

            {
              imageFields.map((field) => {
                if (!field.value) {
                  return null;
                }

                return (
                  <Label
                    key={field.label}
                    kind={kinds.SUCCESS}
                  >
                    {field.label}
                  </Label>
                );
              })
            }
          </div>
      }

      <EditMetadataFileModalConnector
        id={id}
        isOpen={isEditMetadataModalOpen}
        onModalClose={handleEditMetadataModalClose}
      />
    </Card>
  );
}

export default MetadataFile;
