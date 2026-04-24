let accessTokenMemory: string | null = null;

export const tokenStore = {
  getAccessToken(): string | null {
    return accessTokenMemory;
  },
  setAccessToken(token: string | null) {
    accessTokenMemory = token;
  },
  clear() {
    accessTokenMemory = null;
  },
};
