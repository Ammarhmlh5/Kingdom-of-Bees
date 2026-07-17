export const GoogleSignin = {
  configure: () => {},
  hasPlayServices: async () => true,
  signIn: async () => ({ user: { id: '', name: '', email: '', photo: '' } }),
  signOut: async () => {},
  revokeAccess: async () => {},
  isSignedIn: () => false,
  getCurrentUser: () => null,
  getTokens: async () => ({ idToken: '', accessToken: '' }),
};

export const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

export default GoogleSignin;
