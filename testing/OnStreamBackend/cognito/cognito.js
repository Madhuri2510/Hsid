const {Amplify, Auth} = require('aws-amplify');
const client = require('../AxiosClient');
const {build} = inject();
const buildType = () => {
  return build.buildType == 'release' ? '../api' : '../apiQaEnv';
};
const path = buildType();
const api = require(path);
const endPoints = require('../endpoints');
const credentials = require('./credentials');
let user;
let session;
let userId;

if (build.buildType == 'release') {
  Amplify.configure({
    Auth: {
      // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
      identityPoolId: credentials.PROD.COGNITO_FEDERATED_IDENTITY_POOL_ID, //'us-east-1:2b45ef22-1a32-402a-9873-3c9ec783396d',

      // REQUIRED - Amazon Cognito Region
      region: credentials.PROD.AWS_REGION,

      // OPTIONAL - Amazon Cognito User Pool ID
      userPoolId: credentials.PROD.COGNITO_USER_POOL_ID,

      // OPTIONAL - Amazon Cognito Web Client ID (alphanumeric string)
      userPoolWebClientId: credentials.PROD.COGNITO_CLIENT_ID,
    },
  });
} else {
  Amplify.configure({
    Auth: {
      // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
      identityPoolId: credentials.DEV.COGNITO_FEDERATED_IDENTITY_POOL_ID, //'us-east-1:2b45ef22-1a32-402a-9873-3c9ec783396d',

      // REQUIRED - Amazon Cognito Region
      region: credentials.DEV.AWS_REGION,

      // OPTIONAL - Amazon Cognito User Pool ID
      userPoolId: credentials.DEV.COGNITO_USER_POOL_ID,

      // OPTIONAL - Amazon Cognito Web Client ID (alphanumeric string)
      userPoolWebClientId: credentials.DEV.COGNITO_CLIENT_ID,
    },
  });
}

// You can get the current config object
const currentConfig = Auth.configure();

/**
 *
 * @param {string} email
 * @param {string} password
 * @returns cognitoUser
 */
const signIn = async function signIn(email, password) {
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
    user = await signIn(email, password);
  }
  session = user.signInUserSession;
  console.log('session -> ', session);
  return session;
};

/**
 *
 * @param {string} email
 * @param {string} password
 * @returns userId
 */
const getUserId = async function getUserId(email, password) {
  if (session == undefined) {
    session = await getSession(email, password);
  }
  const accessToken = session.accessToken?.jwtToken;
  const sessionObj = {
    cognito: session,
    sessionToken: accessToken,
    user_email: session.idToken?.payload?.email,
  };
  const userDetails = await client.get(
    `${api.heroku.api}${endPoints.HEROKU.users}`,
    {
      headers: {session: JSON.stringify(sessionObj)},
    }
  );
  userId = userDetails.data.result.id;
  console.log('userID###: ', userId);
  return userId;
};

/**
 *
 * @param {string} email
 * @param {string} password
 * @returns new cognito user
 * TODO: Need to send more parameters while creating a user
 */
const signUp = async function signUp(email, password) {
  try {
    user = await Auth.signUp(email, password);
    console.log('Signed up -> ', user);
    console.log(email, 'User created successfully !');
    return user;
  } catch (error) {
    console.log('error signing up -> ', error);
  }
};

/**
 *
 * @param {string} email
 * @param {string} password
 */
const signOut = async function signOut(email, password) {
  try {
    await Auth.signOut(email, password);
    console.log('Signed out -> ', user);
    console.log(email, 'User signed out successfully !');
  } catch (error) {
    console.log('error signing out -> ', error);
  }
};

module.exports = {
  signIn,
  getUserId,
  getSession,
  signUp,
  signOut,
  session,
  userId,
};
