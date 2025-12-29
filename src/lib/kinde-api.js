/**
 * KindeAuthApi - A utility class for interacting with Kinde profile
 * through our backend proxy. Manages M2M token caching.
 */
class KindeAuthApi {
    constructor() {
        this.apiUrl = import.meta.env.PUBLIC_API_URL || 'https://cloudnive-api.nivekaa.com';
        this.tokenKey = 'kinde_m2m_token';
    }

    /**
     * Get a valid Kinde M2M token from local storage or backend
     */
    async getValidToken() {
        try {
            const cached = localStorage.getItem(this.tokenKey);
            if (cached) {
                const { token, expiresAt } = JSON.parse(cached);
                // Refresh if token expires in less than 5 minutes
                if (Date.now() < expiresAt - 300000) {
                    return token;
                }
            }
        } catch (e) {
            console.warn('Failed to parse cached token', e);
        }

        // Fetch new token from backend
        try {
            const response = await fetch(`${this.apiUrl}/user/token`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to fetch M2M token');
            const data = await response.json();

            const expiresAt = Date.now() + (data.expires_in * 1000);
            localStorage.setItem(this.tokenKey, JSON.stringify({
                token: data.access_token,
                expiresAt
            }));

            return data.access_token;
        } catch (error) {
            console.error('KindeAuthApi.getValidToken error:', error);
            throw error;
        }
    }

    /**
     * Get full user details and properties via proxy
     */
    async getUserDetails(userId) {
        try {
            const m2mToken = await this.getValidToken();
            const response = await fetch(`${this.apiUrl}/user/profile?id=${userId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Kinde-M2M-Token': m2mToken
                }
            });
            if (!response.ok) throw new Error(`Failed to get profile: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('KindeAuthApi.getUserDetails error:', error);
            throw error;
        }
    }

    /**
     * Update user profile via proxy
     */
    async updateProfile(userId, data) {
        try {
            const m2mToken = await this.getValidToken();
            const response = await fetch(`${this.apiUrl}/user/profile?id=${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Kinde-M2M-Token': m2mToken
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`Failed to update profile: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('KindeAuthApi.updateProfile error:', error);
            throw error;
        }
    }
}

export const kindeApi = new KindeAuthApi();
export default KindeAuthApi;
