import React from 'react';
import FieldSet from 'Components/FieldSet';
import PageSectionContent from 'Components/Page/PageSectionContent';
import translate from 'Utilities/String/translate';
import MetadataFile from './MetadataFile.tsx';

interface MetadataItem {
  id: number;
  name: string;
  enable: boolean;
  fields: any[];
}

interface MetadataFilesProps {
  isFetching: boolean;
  error?: object;
  items: MetadataItem[];
  [key: string]: any;
}

function MetadataFiles(props: MetadataFilesProps) {
  const {
    items,
    ...otherProps
  } = props;

  return (
    <FieldSet legend={translate('MetadataConsumers')}>
      <PageSectionContent
        errorMessage={translate('UnableToLoadMetadata')}
        {...otherProps}
      >
        <div className="flex flex-wrap">
          {
            items.map((item) => {
              return (
                <MetadataFile
                  key={item.id}
                  {...item}
                />
              );
            })
          }
        </div>
      </PageSectionContent>
    </FieldSet>
  );
}

export default MetadataFiles;
