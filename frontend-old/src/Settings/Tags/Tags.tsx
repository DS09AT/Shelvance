import React from 'react';
import Alert from 'Components/Alert';
import Link from 'Components/Link/Link';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import { FieldSet } from 'ComponentsV2/Layout';
import TagConnector from './TagConnector';

interface TagItem {
  id: number;
  [key: string]: any;
}

interface TagsProps {
  items: TagItem[];
  [key: string]: any;
}

function Tags(props: TagsProps) {
  const { items, ...otherProps } = props;

  if (!items.length) {
    const wikiLink = <Link to="https://wiki.servarr.com/readarr/settings#tags">here</Link>;
    return <Alert kind={kinds.INFO}>{translate('NoTagsHaveBeenAddedYet', [wikiLink])}</Alert>;
  }

  return (
    <FieldSet legend={translate('Tags')}>
      <PageSectionContent errorMessage={translate('UnableToLoadTags')} {...otherProps}>
        <div className="flex flex-wrap gap-4">
          {items.map((item) => {
            return <TagConnector key={item.id} {...item} />;
          })}
        </div>
      </PageSectionContent>
    </FieldSet>
  );
}

export default Tags;
