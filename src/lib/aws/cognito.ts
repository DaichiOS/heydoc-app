import {
	AdminCreateUserCommand,
	AdminCreateUserCommandInput,
	AdminGetUserCommand,
	AdminInitiateAuthCommand,
	AdminSetUserPasswordCommand,
	AdminUpdateUserAttributesCommand,
	AuthFlowType,
	CognitoIdentityProviderClient,
	GlobalSignOutCommand,
	ListUsersCommand
} from '@aws-sdk/client-cognito-identity-provider'
import type {
	CognitoAuthResult,
	CognitoSignUpData,
	CognitoUser,
	UserRole
} from '../../types'
import { config } from '../config'

export class CognitoService {
	private client: CognitoIdentityProviderClient
	private userPoolId: string
	private clientId: string
	private clientSecret: string

	constructor() {
		this.client = new CognitoIdentityProviderClient({
			region: config.cognito.region,
			credentials: {
				accessKeyId: config.aws.accessKeyId,
				secretAccessKey: config.aws.secretAccessKey,
			},
		})
		this.userPoolId = config.cognito.userPoolId
		this.clientId = config.cognito.clientId
		this.clientSecret = config.cognito.clientSecret
	}

	/**
	 * Create a new user in Cognito (Admin only)
	 * Used for inviting doctors and creating admin users
	 */
	async createUser(userData: CognitoSignUpData): Promise<{ success: boolean; userId?: string; error?: string }> {
		try {
			// Use provided password or generate a random temporary password
			const tempPassword = userData.password || this.generateTempPassword()
			
			const params: AdminCreateUserCommandInput = {
				UserPoolId: this.userPoolId,
				Username: userData.email,
				TemporaryPassword: tempPassword,
				UserAttributes: [
					{
						Name: 'email',
						Value: userData.email,
					},
					{
						Name: 'email_verified',
						Value: 'false', // Require email verification
					},
					{
						Name: 'custom:role',
						Value: userData.role,
					},
					...(userData.firstName ? [{
						Name: 'given_name',
						Value: userData.firstName,
					}] : []),
					...(userData.lastName ? [{
						Name: 'family_name',
						Value: userData.lastName,
					}] : []),
				],
			}

			const result = await this.client.send(new AdminCreateUserCommand(params))
			
			if (result.User?.Username) {
				// Don't set permanent password - user will set it during email verification
				return { 
					success: true, 
					userId: result.User.Username 
				}
			}

			return { success: false, error: 'User creation failed' }
		} catch (error: any) {
			console.error('Error creating user:', error)
			return { 
				success: false, 
				error: error.message || 'Failed to create user' 
			}
		}
	}

	/**
	 * Generate a secure random temporary password
	 */
	private generateTempPassword(): string {
		const length = 12
		const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
		let password = ''
		
		// Ensure at least one of each type
		password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
		password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
		password += '0123456789'[Math.floor(Math.random() * 10)]
		password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
		
		// Fill remaining length
		for (let i = password.length; i < length; i++) {
			password += charset[Math.floor(Math.random() * charset.length)]
		}
		
		// Shuffle the password
		return password.split('').sort(() => Math.random() - 0.5).join('')
	}

	/**
	 * Authenticate user with email and password
	 */
	async signIn(email: string, password: string): Promise<CognitoAuthResult | null> {
		try {
			const params = {
				UserPoolId: this.userPoolId,
				ClientId: this.clientId,
				AuthFlow: AuthFlowType.ADMIN_NO_SRP_AUTH,
				AuthParameters: {
					USERNAME: email,
					PASSWORD: password,
					SECRET_HASH: this.calculateSecretHash(email),
				},
			}

			const result = await this.client.send(new AdminInitiateAuthCommand(params))

			if (result.AuthenticationResult) {
				const userInfo = await this.getUserInfo(email)
				
				return {
					accessToken: result.AuthenticationResult.AccessToken!,
					refreshToken: result.AuthenticationResult.RefreshToken!,
					idToken: result.AuthenticationResult.IdToken!,
					user: {
						email: email,
						role: userInfo?.role || 'patient',
						cognitoUserId: userInfo?.username || email,
					},
				}
			}

			return null
		} catch (error: any) {
			console.error('Error signing in:', error)
			throw new Error(error.message || 'Authentication failed')
		}
	}

	/**
	 * Get user information from Cognito
	 */
	async getUserInfo(email: string): Promise<{ username: string; role: UserRole; status: string } | null> {
		try {
			const result = await this.client.send(new AdminGetUserCommand({
				UserPoolId: this.userPoolId,
				Username: email,
			}))

			const roleAttribute = result.UserAttributes?.find(attr => attr.Name === 'custom:role')
			const role = (roleAttribute?.Value as UserRole) || 'patient'

			return {
				username: result.Username!,
				role,
				status: result.UserStatus!,
			}
		} catch (error: any) {
			console.error('Error getting user info:', error)
			return null
		}
	}

	/**
	 * Set user's permanent password (removes temporary password requirement)
	 */
	async setUserPermanentPassword(email: string, password: string): Promise<boolean> {
		try {
			await this.client.send(new AdminSetUserPasswordCommand({
				UserPoolId: this.userPoolId,
				Username: email,
				Password: password,
				Permanent: true,
			}))

			return true
		} catch (error: any) {
			console.error('Error setting permanent password:', error)
			return false
		}
	}

	/**
	 * Update user attributes
	 */
	async updateUserAttributes(email: string, attributes: Record<string, string>): Promise<boolean> {
		try {
			const userAttributes = Object.entries(attributes).map(([name, value]) => ({
				Name: name.startsWith('custom:') ? name : `custom:${name}`,
				Value: value,
			}))

			await this.client.send(new AdminUpdateUserAttributesCommand({
				UserPoolId: this.userPoolId,
				Username: email,
				UserAttributes: userAttributes,
			}))

			return true
		} catch (error: any) {
			console.error('Error updating user attributes:', error)
			return false
		}
	}

	/**
	 * Get all users with a specific role
	 */
	async getUsersByRole(role: UserRole): Promise<CognitoUser[]> {
		try {
			const result = await this.client.send(new ListUsersCommand({
				UserPoolId: this.userPoolId,
				Filter: `custom:role = "${role}"`,
				Limit: 60, // Adjust as needed
			}))

					return result.Users?.map(user => ({
			Username: user.Username || '',
			Attributes: user.Attributes?.map(attr => ({
				Name: attr.Name || '',
				Value: attr.Value || ''
			})) || [],
			UserStatus: user.UserStatus || '',
			Enabled: user.Enabled ?? false,
			UserCreateDate: user.UserCreateDate || new Date(),
			UserLastModifiedDate: user.UserLastModifiedDate || new Date(),
		})) || []
		} catch (error: any) {
			console.error('Error getting users by role:', error)
			return []
		}
	}

	/**
	 * Sign out user globally
	 */
	async signOut(accessToken: string): Promise<boolean> {
		try {
			await this.client.send(new GlobalSignOutCommand({
				AccessToken: accessToken,
			}))
			return true
		} catch (error: any) {
			console.error('Error signing out:', error)
			return false
		}
	}

	/**
	 * Calculate secret hash for Cognito client
	 */
	private calculateSecretHash(username: string): string {
		const crypto = require('crypto')
		const message = username + this.clientId
		const hash = crypto.createHmac('sha256', this.clientSecret)
		hash.update(message)
		return hash.digest('base64')
	}

	/**
	 * Refresh access token
	 */
	async refreshToken(refreshToken: string, email: string): Promise<{ accessToken: string; idToken: string } | null> {
		try {
			const params = {
				UserPoolId: this.userPoolId,
				ClientId: this.clientId,
				AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
				AuthParameters: {
					REFRESH_TOKEN: refreshToken,
					SECRET_HASH: this.calculateSecretHash(email),
				},
			}

			const result = await this.client.send(new AdminInitiateAuthCommand(params))

			if (result.AuthenticationResult) {
				return {
					accessToken: result.AuthenticationResult.AccessToken!,
					idToken: result.AuthenticationResult.IdToken!,
				}
			}

			return null
		} catch (error: any) {
			console.error('Error refreshing token:', error)
			return null
		}
	}

	/**
	 * Enable or disable user
	 */
	async setUserStatus(email: string, enabled: boolean): Promise<boolean> {
		try {
			// In Cognito, we can't directly enable/disable users via SDK
			// Instead, we update a custom attribute to track status
			return await this.updateUserAttributes(email, {
				status: enabled ? 'active' : 'inactive'
			})
		} catch (error: any) {
			console.error('Error setting user status:', error)
			return false
		}
	}
}

// Export singleton instance
export const cognitoService = new CognitoService() 