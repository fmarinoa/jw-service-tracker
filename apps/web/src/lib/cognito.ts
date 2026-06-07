import { Amplify } from 'aws-amplify';

export const configureCognito = () => {
    const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
    const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

    if (!userPoolId || !userPoolClientId) {
        console.warn('Missing Cognito env variables - running in mock mode');
        return false;
    }

    // Amplify v6 configuration
    Amplify.configure({
        Auth: {
            Cognito: {
                userPoolId,
                userPoolClientId,
                loginWith: {
                    email: true
                },
            }
        },
    });

    console.log('✓ Amplify Cognito configured successfully');
    return true;
};

export const getApiUrl = (): string => {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

export const isCognitoConfigured = (): boolean => {
    return !!(
        import.meta.env.VITE_COGNITO_USER_POOL_ID &&
        import.meta.env.VITE_COGNITO_CLIENT_ID &&
        import.meta.env.VITE_COGNITO_REGION
    );
};


