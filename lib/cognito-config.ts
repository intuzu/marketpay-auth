import { Amplify } from 'aws-amplify';

const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-1_dT61kW4Gu',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '4efh34ot557pspu2tkf47c3gh6',
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