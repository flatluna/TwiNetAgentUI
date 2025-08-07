import { Configuration, LogLevel } from '@azure/msal-browser';

const msalConfig: Configuration = {
    auth: {
        clientId: '072a9d7a-1587-47cb-98bc-491b33294d7a',
        authority: 'https://twinetai.b2clogin.com/twinetai.onmicrosoft.com/b2c_1_signupsignin',
        redirectUri: 'http://localhost:5173/auth-redirect',
        postLogoutRedirectUri: 'http://localhost:5173/',
        knownAuthorities: ['twinetai.b2clogin.com'],
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
                if (containsPii) return;
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        break;
                    case LogLevel.Info:
                        console.info(message);
                        break;
                    case LogLevel.Verbose:
                        console.debug(message);
                        break;
                    case LogLevel.Warning:
                        console.warn(message);
                        break;
                }
            },
            logLevel: LogLevel.Info,
            piiLoggingEnabled: false,
        },
    },
};

export default msalConfig;
