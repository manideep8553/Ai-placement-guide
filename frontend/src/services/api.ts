const API_BASE = 'http://localhost:5000/api'

interface ApiResponse<T> {
  data?: T
  error?: string
  code?: string
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
    const json = await res.json()
    if (!res.ok) {
      return { error: json.error || 'Request failed', code: json.code }
    }
    return { data: json }
  } catch {
    return { error: 'Network error', code: 'NETWORK_ERROR' }
  }
}

export interface AuthUser {
  id: string
  email: string
  name: string
  college?: string
  branch?: string
  graduationYear?: number
}

interface LoginResponse {
  user: AuthUser
  token: string
}

interface RegisterResponse {
  user: AuthUser
  token: string
}

export function loginApi(email: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function registerApi(name: string, email: string, password: string) {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export function logoutApi() {
  return request('/auth/logout', { method: 'POST' })
}
