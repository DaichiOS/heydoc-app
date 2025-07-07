import { db } from '@/lib/db/connection'
import { doctors, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		console.log('🔍 Debug: Fetching all doctors from database...')
		
		// Get all doctors with their user info
		const allDoctors = await db
			.select({
				id: doctors.id,
				firstName: doctors.firstName,
				lastName: doctors.lastName,
				email: users.email,
				phone: doctors.phone,
				ahpraNumber: doctors.ahpraNumber,
				medicalSpecialty: doctors.medicalSpecialty,
				status: doctors.status,
				createdAt: doctors.createdAt,
				updatedAt: doctors.updatedAt,
			})
			.from(doctors)
			.innerJoin(users, eq(doctors.userId, users.id))
			.orderBy(doctors.createdAt)

		console.log('📊 Total doctors found:', allDoctors.length)
		console.log('📋 All doctors:', allDoctors.map(doctor => ({
			id: doctor.id,
			name: `${doctor.firstName} ${doctor.lastName}`,
			email: doctor.email,
			status: doctor.status,
			createdAt: doctor.createdAt
		})))

		// Group by status
		const statusCounts = allDoctors.reduce((acc, doctor) => {
			acc[doctor.status] = (acc[doctor.status] || 0) + 1
			return acc
		}, {} as Record<string, number>)

		console.log('📈 Status counts:', statusCounts)

		return NextResponse.json({
			success: true,
			data: {
				totalDoctors: allDoctors.length,
				doctors: allDoctors,
				statusCounts,
				pendingDoctors: allDoctors.filter(d => d.status === 'pending'),
				documentationRequiredDoctors: allDoctors.filter(d => d.status === 'documentation_required'),
			}
		})

	} catch (error) {
		console.error('❌ Debug doctors API error:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch doctors debug info' },
			{ status: 500 }
		)
	}
} 