import { PublicClientApplication } from '@azure/msal-browser';
import msalConfig from './msalConfig';

console.log('Initializing MSAL instance');
const msalInstance = new PublicClientApplication(msalConfig);
console.log('MSAL instance initialized');

export const initializeMsal = () => msalInstance.initialize();
export default msalInstance;
