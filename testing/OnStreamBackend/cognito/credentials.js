const DEV = {
  COGNITO_USER_POOL_ID: 'us-west-2_F2FDNAU7o',
  COGNITO_FEDERATED_IDENTITY_POOL_ID:
    'us-west-2:3df57523-de3c-4950-8288-4fa77ccdf615',
  COGNITO_CLIENT_ID: '1gtht5djhng4h7j2qfjr9eh5kh',
  AWS_REGION: 'us-west-2',
};

const PROD = {
  COGNITO_USER_POOL_ID: 'us-east-1_5Cb4yfoAN',
  COGNITO_FEDERATED_IDENTITY_POOL_ID:
    'us-east-1:2b45ef22-1a32-402a-9873-3c9ec783396d',
  COGNITO_CLIENT_ID: 'hvktabh833mun7c35om4lv0du',
  AWS_REGION: 'us-east-1',
};

const CMP_DEV = {
  COGNITO_USER_POOL_ID: 'us-west-2_Cgu6qzNRn',
  COGNITO_CLIENT_ID: '210eb1f0v30pbeqha7ckdhp1u9',
  AWS_REGION: 'us-west-2',
  };

// Avoiding usage to prevent unnecessary editing on prod environment
const CMP_PROD = {};

module.exports = {DEV, PROD, CMP_DEV, CMP_PROD};
