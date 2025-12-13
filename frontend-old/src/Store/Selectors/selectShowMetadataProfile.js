import { createSelector } from 'reselect';

const selectShowMetadataProfile = createSelector(
  (state) => state.settings.metadataProfiles,
  (metadataProfiles) => metadataProfiles.items.length > 1
);

export default selectShowMetadataProfile;
