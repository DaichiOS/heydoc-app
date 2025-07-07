export interface InterviewEmailData {
	doctorEmail: string
	doctorName: string
	calendlyLink: string
	adminName?: string
}

export class EmailService {
	/**
	 * Generate mailto link for interview invitation
	 * Uses the same beautiful theme as your Cognito emails
	 */
	generateInterviewMailtoLink(data: InterviewEmailData): string {
		const subject = 'HeyDoc Interview Invitation - Schedule Your Interview'
		const body = this.generateInterviewEmailTemplate(data)
		
		// Create mailto link with encoded subject and body
		const mailtoLink = `mailto:${data.doctorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
		
		return mailtoLink
	}

	/**
	 * Generate interview invitation email template using your theme
	 */
	private generateInterviewEmailTemplate(data: InterviewEmailData): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Invitation - HeyDoc</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Karla', system-ui, sans-serif;
            line-height: 1.6;
            color: #0f172a;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #EFF4F9;
        }
        
        .email-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 48px 40px;
            border: 1px solid rgba(203, 213, 225, 0.3);
            box-shadow: 0 4px 16px rgba(28, 27, 58, 0.1);
            max-width: 560px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 32px;
        }
        
        .logo {
            margin-bottom: 24px;
            text-align: center;
        }
        
        .logo img {
            max-width: 240px;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        
        h1 {
            color: #1C1B3A;
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 20px;
            text-align: center;
            line-height: 1.3;
        }
        
        .intro {
            font-size: 18px;
            color: #334155;
            text-align: center;
            margin-bottom: 36px;
            line-height: 1.5;
        }
        
        .interview-details {
            background: rgba(28, 27, 58, 0.05);
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
            border: 1px solid rgba(28, 27, 58, 0.1);
        }
        
        .interview-details h3 {
            color: #1C1B3A;
            margin-top: 0;
            margin-bottom: 16px;
            font-size: 18px;
            font-weight: 600;
        }
        
        .interview-details ul {
            margin: 12px 0;
            padding-left: 20px;
        }
        
        .interview-details li {
            color: #475569;
            margin-bottom: 8px;
            font-size: 15px;
        }
        
        .cta-container {
            text-align: center;
            margin: 32px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: #1C1B3A;
            color: white !important;
            text-decoration: none;
            padding: 18px 36px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.2s ease;
            border: none;
        }
        
        .cta-button:hover {
            background: #252347;
            transform: translateY(-1px);
        }
        
        .support-info {
            background: rgba(59, 130, 246, 0.05);
            backdrop-filter: blur(8px);
            padding: 20px;
            border-radius: 12px;
            margin: 32px 0;
            text-align: center;
            border: 1px solid rgba(59, 130, 246, 0.1);
        }
        
        .support-info p {
            margin: 8px 0;
            color: #475569;
            font-size: 14px;
        }
        
        .footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #cbd5e1;
            text-align: center;
        }
        
        .signature {
            color: #1C1B3A;
            font-weight: 500;
            margin-bottom: 8px;
        }
        
        .team {
            color: #64748b;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
                <img src="https://raw.githubusercontent.com/DaichiOS/logos/main/heydoc.png" alt="HeyDoc" />
            </div>
        </div>

        <h1>🎉 Congratulations ${data.doctorName}!</h1>
        
        <p class="intro">Your HeyDoc application has been approved for interview! We're excited to speak with you about joining our fertility referral network.</p>

        <div class="interview-details">
            <h3>📅 Next Steps</h3>
            <p><strong>Please schedule your interview using the link below:</strong></p>
            <p>Our team will discuss your experience, answer questions about HeyDoc, and walk you through our platform.</p>
        </div>

        <div class="cta-container">
            <a href="${data.calendlyLink}" class="cta-button">
                📅 Schedule Your Interview
            </a>
        </div>

        <div class="interview-details">
            <h3>🔍 What to Expect</h3>
            <ul>
                <li><strong>Duration:</strong> 30-45 minutes</li>
                <li><strong>Format:</strong> Video call via Google Meet</li>
                <li><strong>Topics:</strong> Your experience, HeyDoc platform overview, Q&A</li>
                <li><strong>Documents:</strong> Please have your AHPRA registration ready</li>
            </ul>
            
            <h3>💡 Interview Tips</h3>
            <ul>
                <li>Ensure you have a stable internet connection</li>
                <li>Find a quiet, professional environment</li>
                <li>Have your medical credentials accessible</li>
                <li>Prepare questions about our fertility referral process</li>
            </ul>
        </div>

        <div class="support-info">
            <p><strong>Questions?</strong></p>
            <p>Contact our team at <a href="mailto:admin@heydochealth.com.au" style="color: #1C1B3A; text-decoration: none; font-weight: 500;">admin@heydochealth.com.au</a> if you have any questions.</p>
        </div>

        <div class="footer">
            <p class="signature">We look forward to speaking with you soon!</p>
            <p class="signature">Best regards,<br>${data.adminName || 'The HeyDoc Team'}</p>
            <p class="team">© 2025 HeyDoc. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
	}

	/**
	 * Generate simple text version for email clients that don't support HTML
	 */
	generateInterviewTextTemplate(data: InterviewEmailData): string {
		return `🎉 Congratulations ${data.doctorName}!

Your HeyDoc application has been approved for interview!

📅 SCHEDULE YOUR INTERVIEW:
${data.calendlyLink}

🔍 WHAT TO EXPECT:
• Duration: 30-45 minutes
• Format: Video call via Google Meet
• Topics: Your experience, HeyDoc platform overview, Q&A
• Documents: Please have your AHPRA registration ready

💡 INTERVIEW TIPS:
• Ensure stable internet connection
• Find a quiet, professional environment
• Have your medical credentials accessible
• Prepare questions about our fertility referral process

Questions? Contact us at admin@heydochealth.com.au

Best regards,
${data.adminName || 'The HeyDoc Team'}
HeyDoc Health Platform

© 2025 HeyDoc. All rights reserved.`
	}
} 