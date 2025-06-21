require('dotenv').config({ path: '.env' })
const { CognitoIdentityProviderClient, ConfirmForgotPasswordCommand } = require('@aws-sdk/client-cognito-identity-provider')
const crypto = require('crypto')

const cognitoClient = new CognitoIdentityProviderClient({
	region: process.env.AWS_REGION || 'ap-southeast-2',
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
})

// Calculate SECRET_HASH for Cognito
function calculateSecretHash(username, clientId, clientSecret) {
	const message = username + clientId
	return crypto.createHmac('sha256', clientSecret).update(message).digest('base64')
}

async function completePasswordReset() {
	const email = 'eddie@heydochealth.com.au'
	
	// Get the reset code and new password from command line
	const resetCode = process.argv[2]
	const newPassword = process.argv[3]
	
	if (!resetCode || !newPassword) {
		console.log('Usage: node scripts/complete-password-reset.js <reset-code> <new-password>')
		console.log('Example: node scripts/complete-password-reset.js 123456 MyNewPassword2024!')
		process.exit(1)
	}
	
	const clientId = '5b8tckb87995lqr6iqb4t452rt'
	const clientSecret = process.env.COGNITO_CLIENT_SECRET
	
	if (!clientSecret) {
		console.error('❌ COGNITO_CLIENT_SECRET not found in .env file')
		process.exit(1)
	}
	
	try {
		console.log('Completing password reset for:', email)
		console.log('Using reset code:', resetCode)
		console.log('Client ID:', clientId)
		
		// Calculate SECRET_HASH
		const secretHash = calculateSecretHash(email, clientId, clientSecret)
		
		const command = new ConfirmForgotPasswordCommand({
			ClientId: clientId,
			Username: email,
			ConfirmationCode: resetCode,
			Password: newPassword,
			SecretHash: secretHash,
		})
		
		const response = await cognitoClient.send(command)
		console.log('✅ Password reset completed successfully!')
		console.log('You can now login with your new password')
		
	} catch (error) {
		console.error('❌ Error completing password reset:', error.message)
		
		if (error.name === 'CodeMismatchException') {
			console.log('The reset code is incorrect or has expired. Please request a new one.')
		} else if (error.name === 'InvalidPasswordException') {
			console.log('Password does not meet requirements. Try a stronger password.')
		} else if (error.name === 'ExpiredCodeException') {
			console.log('The reset code has expired. Please request a new one.')
		}
	}
}

completePasswordReset() 