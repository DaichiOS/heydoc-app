import { verifyToken } from '@/lib/auth/cookies'
import { NextRequest, NextResponse } from 'next/server'

// Define protected routes
const PROTECTED_ROUTES = {
	admin: ['/admin'],
	doctor: ['/doctor'],
	patient: ['/patient'],
	auth: ['/login', '/register', '/verify-email', '/verify-email-sent']
}

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
	'/',
	'/login',
	'/register',
	'/verify-email',
	'/verify-email-sent',
	'/api/auth/login',
	'/api/auth/register',
	'/api/auth/verify-email',
	'/api/debug',
	'/_next',
	'/favicon.ico',
	'/public'
]

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	
	// Skip middleware for public routes, static files, and API routes that don't need auth
	if (isPublicRoute(pathname)) {
		return NextResponse.next()
	}

	// Get the auth token from cookies
	const token = request.cookies.get('heydoc_auth')?.value

	if (!token) {
		return redirectToLogin(request)
	}

	try {
		// Verify the JWT token
		const user = await verifyToken(token)
		
		if (!user) {
			return redirectToLogin(request)
		}

		// Check role-based access
		if (!hasRequiredRole(pathname, user.role)) {
			return redirectToUnauthorized(request, user.role)
		}

		// If user is authenticated but tries to access auth pages, redirect to dashboard
		if (isAuthRoute(pathname) && user) {
			return redirectToDashboard(user.role)
		}

		// Add user info to request headers for server components
		const requestHeaders = new Headers(request.headers)
		requestHeaders.set('x-user-id', user.id)
		requestHeaders.set('x-user-email', user.email)
		requestHeaders.set('x-user-role', user.role)
		requestHeaders.set('x-user-status', user.status)

		return NextResponse.next({
			request: {
				headers: requestHeaders,
			},
		})
	} catch (error) {
		console.error('Middleware auth error:', error)
		return redirectToLogin(request)
	}
}

/**
 * Check if the route is public and doesn't require authentication
 */
function isPublicRoute(pathname: string): boolean {
	return PUBLIC_ROUTES.some(route => {
		if (route.endsWith('*')) {
			return pathname.startsWith(route.slice(0, -1))
		}
		return pathname === route || pathname.startsWith(route + '/')
	})
}

/**
 * Check if the route is an auth route
 */
function isAuthRoute(pathname: string): boolean {
	return PROTECTED_ROUTES.auth.some(route => pathname.startsWith(route))
}

/**
 * Check if user has required role for the route
 */
function hasRequiredRole(pathname: string, userRole: string): boolean {
	// Admin routes
	if (PROTECTED_ROUTES.admin.some(route => pathname.startsWith(route))) {
		return userRole === 'admin'
	}

	// Doctor routes
	if (PROTECTED_ROUTES.doctor.some(route => pathname.startsWith(route))) {
		return userRole === 'doctor' || userRole === 'admin'
	}

	// Patient routes
	if (PROTECTED_ROUTES.patient.some(route => pathname.startsWith(route))) {
		return userRole === 'patient' || userRole === 'admin'
	}

	// All other routes allow any authenticated user
	return true
}

/**
 * Redirect to login page
 */
function redirectToLogin(request: NextRequest): NextResponse {
	const loginUrl = new URL('/login', request.url)
	loginUrl.searchParams.set('from', request.nextUrl.pathname)
	return NextResponse.redirect(loginUrl)
}

/**
 * Redirect to appropriate dashboard based on role
 */
function redirectToDashboard(role: string): NextResponse {
	switch (role) {
		case 'admin':
			return NextResponse.redirect(new URL('/admin/dashboard'))
		case 'doctor':
			return NextResponse.redirect(new URL('/doctor/profile'))
		case 'patient':
			return NextResponse.redirect(new URL('/patient/dashboard'))
		default:
			return NextResponse.redirect(new URL('/'))
	}
}

/**
 * Redirect to unauthorized page
 */
function redirectToUnauthorized(request: NextRequest, userRole: string): NextResponse {
	// Redirect to appropriate dashboard if user tries to access wrong role's area
	switch (userRole) {
		case 'admin':
			return NextResponse.redirect(new URL('/admin/dashboard', request.url))
		case 'doctor':
			return NextResponse.redirect(new URL('/doctor/profile', request.url))
		case 'patient':
			return NextResponse.redirect(new URL('/patient/dashboard', request.url))
		default:
			return NextResponse.redirect(new URL('/', request.url))
	}
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api/debug (debug endpoints)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public (public files)
		 */
		'/((?!api/debug|_next/static|_next/image|favicon.ico|public).*)',
	],
} 