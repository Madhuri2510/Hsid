const ENDPOINTS = {
  CMP: {
    SMARTBOX_ID: '/property?smartboxId=',
    PROPERTY: '/property/',
    CONFIG: '/configuration?platform=',
    HOME_PAGE_TEMPLATE: '/template/',
  },
  HEROKU: {
    users: '/users',
    favorites: {
      getFavorites: '/favorite/get-favorite-channels',
      addFavorite: '/favorite/add-favorite-channel',
      removeFavorite: '/favorite/remove-favorite-channel',
    },
    parentalControls: '/parental-controls/',
    channelGenres: '/channel-genres/',
  },
  SPORTS: {
    games: '/games?',
  },
  CMP_BACKEND: {
    PROPERTY: '/property/',
    CMP_PROPERTY: '/cmp_property',
    TEMPLATE: '/cmp_template',
    USER: '/cmp_user',
    ORGANIZATION: '/organization',
    FIELDS_AND_VALUES: '/fieldsAndValues',
    ELEMENTS_WIDGET_TYPES: '/elementsWidgetTypes/',
    FIELDS: '/fields',
    ELEMENTS: '/elements/',
    WIDGET_TYPE_IDS: '/widgetTypeIds',
    UPDATE: 'update',
    V2: '/v2',
  },
};
module.exports = ENDPOINTS;
