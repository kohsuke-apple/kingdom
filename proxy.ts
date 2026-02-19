import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

export function proxy(request: NextRequest) {
  const authUser = process.env.BASIC_AUTH_USER
  const authPassword = process.env.BASIC_AUTH_PASSWORD

  if (!authUser || !authPassword) {
    return new NextResponse('Server configuration error', { status: 500 })
  }

  const authorization = request.headers.get('authorization')

  if (authorization) {
    const [scheme, encoded] = authorization.split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded)
      const colonIndex = decoded.indexOf(':')
      const user = decoded.substring(0, colonIndex)
      const password = decoded.substring(colonIndex + 1)

      if (user === authUser && password === authPassword) {
        const response = NextResponse.next()
        response.headers.set('X-Robots-Tag', 'noindex, nofollow')
        return response
      }
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Kingdom - Private Access"',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
