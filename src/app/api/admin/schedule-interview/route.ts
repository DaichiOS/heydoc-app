import { requireServerAdmin } from '@/lib/auth/server'
import { AdminService } from '@/lib/services/admin-service'
import { EmailService } from '@/lib/services/email-service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		// Require admin authentication
		const admin = await requireServerAdmin()
		
		const { doctorId, calendlyLink, adminName } = await request.json()

		if (!doctorId) {
			return NextResponse.json(
				{ error: 'Doctor ID is required' },
				{ status: 400 }
			)
		}

		if (!calendlyLink) {
			return NextResponse.json(
				{ error: 'Calendly link is required' },
				{ status: 400 }
			)
		}

		const adminService = new AdminService()
		const emailService = new EmailService()

		// Get doctor application details
		const doctorApplication = await adminService.getDoctorApplication(doctorId)
		
		if (!doctorApplication) {
			return NextResponse.json(
				{ error: 'Doctor application not found' },
				{ status: 404 }
			)
		}

		// Update doctor status to interview_scheduled
		await adminService.scheduleInterview(
			doctorId,
			admin.id,
			'Interview scheduled via admin panel'
		)

		// Generate mailto link with beautiful themed email
		const doctorName = `${doctorApplication.firstName} ${doctorApplication.lastName}`.trim()
		const mailtoLink = emailService.generateInterviewMailtoLink({
			doctorEmail: doctorApplication.email,
			doctorName: doctorName || 'Doctor',
			calendlyLink,
			adminName: adminName || admin.email
		})

		return NextResponse.json({
			success: true,
			message: 'Interview scheduled successfully',
			mailtoLink,
			doctorName,
			doctorEmail: doctorApplication.email
		})

	} catch (error) {
		console.error('Schedule interview error:', error)
		return NextResponse.json(
			{ error: 'Failed to schedule interview' },
			{ status: 500 }
		)
	}
} 