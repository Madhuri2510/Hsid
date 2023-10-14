const {Amplify, Auth} = require('aws-amplify');
const {build} = inject();
const buildType = () => {
  return build.buildType == 'release' ? '../api' : '../apiQaEnv';
};
const path = buildType();
const credentials = require('./credentials');
let user;
let session;
let bearerToken;
let userName;

if (build.buildType == 'release') {
  Amplify.configure({
    Auth: {
      // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
      identityPoolId: credentials.CMP_PROD.COGNITO_FEDERATED_IDENTITY_POOL_ID, //'us-east-1:2b45ef22-1a32-402a-9873-3c9ec783396d',

      // REQUIRED - Amazon Cognito Region
      region: credentials.CMP_PROD.AWS_REGION,

      // OPTIONAL - Amazon Cognito User Pool ID
      userPoolId: credentials.CMP_PROD.COGNITO_USER_POOL_ID,

      // OPTIONAL - Amazon Cognito Web Client ID (alphanumeric string)
      userPoolWebClientId: credentials.CMP_PROD.COGNITO_CLIENT_ID,
    },
  });
} else {
  Amplify.configure({
    Auth: {
      // REQUIRED - Amazon Cognito Region
      region: credentials.CMP_DEV.AWS_REGION,

      // OPTIONAL - Amazon Cognito User Pool ID
      userPoolId: credentials.CMP_DEV.COGNITO_USER_POOL_ID,

      // OPTIONAL - Amazon Cognito Web Client ID (alphanumeric string)
      userPoolWebClientId: credentials.CMP_DEV.COGNITO_CLIENT_ID,
    },
  });
}

// You can get the current config object
const currentConfig = Auth.configure();

const cmpSignIn = async function cmpSignIn(email, password) {
  try {
    user = await Auth.signIn(email, password);
    console.log(email, 'User logged in successfully !');
    return user;
  } catch (error) {
    console.log('error signing in -> ', error);
  }
};

/**
 *
 * @param {string} email
 * @param {string} password
 * @returns session object
 */
const getSession = async function getSession(email, password) {
  if (user == undefined) {
    user = await cmpSignIn(email, password);
  }
  session = user.signInUserSession;
  return session;
};

const getAccessToken = async function getAccessToken(email, password) {
  if (session == undefined) {
    session = await getSession(email, password);
  }
  const idToken = session.idToken?.jwtToken;
  bearerToken = idToken;
  return idToken;
};

const getUserName = async function getUserName(email, password) {
  if (user == undefined) {
    user = await cmpSignIn(email, password);
  }
  userName = user.attributes.name;
  return userName;
};

module.exports = {
  cmpSignIn,
  getSession,
  getAccessToken,
  getUserName,
  bearerToken,
};
