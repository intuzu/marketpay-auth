import { Amplify } from 'aws-amplify';

const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-1_dT61kW4Gu',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '1295m9tog992lo25vi86fdge1i',
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        email: true,
        username: true,
      },
    },
  },
};

// Configure Amplify
Amplify.configure(cognitoConfig);

export default cognitoConfig;