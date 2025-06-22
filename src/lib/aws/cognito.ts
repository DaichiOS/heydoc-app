import {
	AdminCreateUserCommand,
	AdminCreateUserCommandInput,
	AdminGetUserCommand,
	AdminInitiateAuthCommand,
	AdminRespondToAuthChallengeCommand,
	AdminSetUserPasswordCommand,
	AdminUpdateUserAttributesCommand,
	AuthFlowType,
	ChallengeNameType,
	CognitoIdentityProviderClient,
	GetUserCommand,
	GlobalSignOutCommand,
	ListUsersCommand,
	ResendConfirmationCodeCommand
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
				// Configure the email template with proper verification link
				ClientMetadata: {
					verification_url: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email`,
				},
				// Remove MessageAction: 'SUPPRESS' to allow invitation emails to be sent
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

	/**
	 * Resend confirmation code for email verification
	 * For admin-created users, we need to resend the invitation
	 */
	async resendConfirmationCode(email: string): Promise<{ success: boolean; error?: string }> {
		try {
			console.log('🔍 Attempting to resend confirmation code for:', email)
			
			// For admin-created users, we need to check if they exist and resend invitation
			const userInfo = await this.getUserInfo(email)
			
			if (!userInfo) {
				console.error('❌ User not found in Cognito:', email)
				return { 
					success: false, 
					error: 'User not found. Please ensure you have registered with this email address.' 
				}
			}

			console.log('✅ User found with status:', userInfo.status)

			// If user is in FORCE_CHANGE_PASSWORD status, resend the invitation
			if (userInfo.status === 'FORCE_CHANGE_PASSWORD') {
				console.log('🔄 Resending invitation for user in FORCE_CHANGE_PASSWORD status')
				
				// Resend invitation by creating the user again with MessageAction RESEND
				const params: AdminCreateUserCommandInput = {
					UserPoolId: this.userPoolId,
					Username: email,
					MessageAction: 'RESEND', // This will resend the invitation email
					ClientMetadata: {
						verification_url: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email`,
					},
				}

				await this.client.send(new AdminCreateUserCommand(params))
				console.log('✅ Invitation email resent successfully')
				return { success: true }
			} else {
				console.log('🔄 Using regular resend confirmation code for status:', userInfo.status)
				
				// For other statuses, use the regular resend confirmation code
				const params = {
					ClientId: this.clientId,
					Username: email,
					SecretHash: this.calculateSecretHash(email),
					ClientMetadata: {
						verification_url: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email`,
					},
				}

				await this.client.send(new ResendConfirmationCodeCommand(params))
				console.log('✅ Confirmation code resent successfully')
				return { success: true }
			}
		} catch (error: any) {
			console.error('❌ Error resending confirmation code:', {
				error: error.message,
				code: error.code,
				name: error.name,
				type: error.__type,
				statusCode: error.$metadata?.httpStatusCode,
			})
			
			// Provide more specific error messages
			let errorMessage = 'Failed to resend confirmation code'
			
			if (error.name === 'UserNotFoundException' || error.__type === 'UserNotFoundException') {
				errorMessage = 'User not found. Please ensure you have registered with this email address.'
			} else if (error.name === 'InvalidParameterException') {
				errorMessage = 'Invalid email address format.'
			} else if (error.name === 'LimitExceededException') {
				errorMessage = 'Too many requests. Please wait a few minutes before trying again.'
			} else if (error.message) {
				errorMessage = error.message
			}
			
			return { 
				success: false, 
				error: errorMessage
			}
		}
	}

	/**
	 * Verify temporary password (handles NEW_PASSWORD_REQUIRED challenge)
	 */
	async verifyTemporaryPassword(email: string, temporaryPassword: string): Promise<{ success: boolean; session?: string; error?: string }> {
		try {
			const params = {
				UserPoolId: this.userPoolId,
				ClientId: this.clientId,
				AuthFlow: AuthFlowType.ADMIN_NO_SRP_AUTH,
				AuthParameters: {
					USERNAME: email,
					PASSWORD: temporaryPassword,
					SECRET_HASH: this.calculateSecretHash(email),
				},
			}

			const result = await this.client.send(new AdminInitiateAuthCommand(params))

			// If authentication is successful without challenge, return success
			if (result.AuthenticationResult) {
				return { success: true }
			}

			// If NEW_PASSWORD_REQUIRED challenge, return success with session
			if (result.ChallengeName === ChallengeNameType.NEW_PASSWORD_REQUIRED) {
				return { 
					success: true, 
					session: result.Session 
				}
			}

			return { success: false, error: 'Invalid temporary password' }
		} catch (error: any) {
			console.error('Error verifying temporary password:', error)
			
			// Handle specific Cognito errors
			if (error.name === 'NotAuthorizedException') {
				return { success: false, error: 'Invalid email or temporary password' }
			}
			if (error.name === 'UserNotFoundException') {
				return { success: false, error: 'User not found' }
			}
			if (error.name === 'PasswordResetRequiredException') {
				return { success: false, error: 'Password reset required' }
			}
			
			return { success: false, error: error.message || 'Failed to verify temporary password' }
		}
	}

	/**
	 * Set permanent password after temporary password verification
	 */
	async setPermanentPassword(email: string, temporaryPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
		try {
			// First verify the temporary password and get session
			const verifyResult = await this.verifyTemporaryPassword(email, temporaryPassword)
			
			if (!verifyResult.success) {
				return { success: false, error: verifyResult.error }
			}

			// If we have a session (NEW_PASSWORD_REQUIRED challenge), respond to it
			if (verifyResult.session) {
				const challengeParams = {
					UserPoolId: this.userPoolId,
					ClientId: this.clientId,
					ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
					Session: verifyResult.session,
					ChallengeResponses: {
						USERNAME: email,
						NEW_PASSWORD: newPassword,
						SECRET_HASH: this.calculateSecretHash(email),
					},
				}

				const challengeResult = await this.client.send(new AdminRespondToAuthChallengeCommand(challengeParams))
				
				if (challengeResult.AuthenticationResult) {
					return { success: true }
				}
			} else {
				// If no session, use the direct password set method
				const success = await this.setUserPermanentPassword(email, newPassword)
				return { success, error: success ? undefined : 'Failed to set permanent password' }
			}

			return { success: false, error: 'Failed to set permanent password' }
		} catch (error: any) {
			console.error('Error setting permanent password:', error)
			
			// Handle specific Cognito errors
			if (error.name === 'InvalidPasswordException') {
				return { success: false, error: 'Password does not meet requirements' }
			}
			if (error.name === 'NotAuthorizedException') {
				return { success: false, error: 'Invalid temporary password' }
			}
			
			return { success: false, error: error.message || 'Failed to set permanent password' }
		}
	}

	/**
	 * Validate access token by getting user info from Cognito
	 */
	async validateAccessToken(accessToken: string): Promise<boolean> {
		try {
			// Use GetUser command which validates the access token
			await this.client.send(new GetUserCommand({
				AccessToken: accessToken,
			}))
			
			return true
		} catch (error: any) {
			console.error('Token validation failed:', error.name, error.message)
			return false
		}
	}
}

// Export singleton instance
export const cognitoService = new CognitoService() 