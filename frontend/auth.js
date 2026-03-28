// Cognito Authentication Library
// Uses Amazon Cognito Identity SDK for JavaScript

// Configuration - Update these with your Cognito details
const COGNITO_CONFIG = {
    UserPoolId: 'us-east-1_YXmExZcxg', // Replace with your User Pool ID
    ClientId: '1njbva5t2pojkj6lbohejginf8', // Replace with your Client ID
    Region: 'us-east-1'
};

// Amazon Cognito Identity SDK is loaded via CDN in HTML
// We'll use the global AmazonCognitoIdentity object

class Auth {
    constructor() {
        this.userPool = null;
        this.currentUser = null;
        this.initializeUserPool();
    }

    initializeUserPool() {
        if (typeof AmazonCognitoIdentity === 'undefined') {
            console.error('Amazon Cognito Identity SDK not loaded');
            return;
        }

        this.userPool = new AmazonCognitoIdentity.CognitoUserPool({
            UserPoolId: COGNITO_CONFIG.UserPoolId,
            ClientId: COGNITO_CONFIG.ClientId
        });
    }

    // Sign up new user
    signUp(email, password, name) {
        return new Promise((resolve, reject) => {
            const attributeList = [
                new AmazonCognitoIdentity.CognitoUserAttribute({
                    Name: 'email',
                    Value: email
                }),
                new AmazonCognitoIdentity.CognitoUserAttribute({
                    Name: 'name',
                    Value: name
                })
            ];

            this.userPool.signUp(email, password, attributeList, null, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                // User is auto-confirmed by Lambda trigger
                resolve(result.user);
            });
        });
    }

    // Sign in user
    signIn(email, password) {
        return new Promise((resolve, reject) => {
            const authenticationData = {
                Username: email,
                Password: password
            };

            const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

            const userData = {
                Username: email,
                Pool: this.userPool
            };

            const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    this.currentUser = cognitoUser;
                    
                    // Store session info
                    const accessToken = result.getAccessToken().getJwtToken();
                    const idToken = result.getIdToken().getJwtToken();
                    const refreshToken = result.getRefreshToken().getToken();
                    
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('idToken', idToken);
                    localStorage.setItem('refreshToken', refreshToken);
                    
                    resolve(result);
                },
                onFailure: (err) => {
                    reject(err);
                },
                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    reject(new Error('New password required'));
                }
            });
        });
    }

    // Sign out user
    signOut() {
        const cognitoUser = this.userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.signOut();
        }
        
        // Clear stored tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        
        this.currentUser = null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        const cognitoUser = this.userPool.getCurrentUser();
        
        return new Promise((resolve, reject) => {
            if (!cognitoUser) {
                resolve(false);
                return;
            }

            cognitoUser.getSession((err, session) => {
                if (err) {
                    resolve(false);
                    return;
                }
                
                resolve(session.isValid());
            });
        });
    }

    // Get current user info
    getCurrentUser() {
        return new Promise((resolve, reject) => {
            const cognitoUser = this.userPool.getCurrentUser();
            
            if (!cognitoUser) {
                reject(new Error('No user logged in'));
                return;
            }

            cognitoUser.getSession((err, session) => {
                if (err) {
                    reject(err);
                    return;
                }

                cognitoUser.getUserAttributes((err, attributes) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const userInfo = {};
                    attributes.forEach(attr => {
                        userInfo[attr.getName()] = attr.getValue();
                    });

                    resolve(userInfo);
                });
            });
        });
    }

    // Get ID token for API calls
    getIdToken() {
        return localStorage.getItem('idToken');
    }

    // Change password
    changePassword(oldPassword, newPassword) {
        return new Promise((resolve, reject) => {
            const cognitoUser = this.userPool.getCurrentUser();
            
            if (!cognitoUser) {
                reject(new Error('No user logged in'));
                return;
            }

            cognitoUser.getSession((err, session) => {
                if (err) {
                    reject(err);
                    return;
                }

                cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            });
        });
    }

    // Forgot password - initiate reset
    forgotPassword(email) {
        return new Promise((resolve, reject) => {
            const userData = {
                Username: email,
                Pool: this.userPool
            };

            const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

            cognitoUser.forgotPassword({
                onSuccess: (result) => {
                    resolve(result);
                },
                onFailure: (err) => {
                    reject(err);
                }
            });
        });
    }

    // Confirm password reset
    confirmPassword(email, verificationCode, newPassword) {
        return new Promise((resolve, reject) => {
            const userData = {
                Username: email,
                Pool: this.userPool
            };

            const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

            cognitoUser.confirmPassword(verificationCode, newPassword, {
                onSuccess: () => {
                    resolve('Password reset successful');
                },
                onFailure: (err) => {
                    reject(err);
                }
            });
        });
    }
}

// Create singleton instance
const auth = new Auth();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = auth;
}
