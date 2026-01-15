import axios, { AxiosError, AxiosResponse } from 'axios'

const API_URL = (import.meta as any).env?.VITE_API_URL
  ? `${(import.meta as any).env.VITE_API_URL}/api`
  : 'http://localhost:5000/api'

// Server error response interface
export interface ServerErrorResponse {
  statusCode: number
  success: boolean
  message: string
  isOperational?: boolean
  details?: any
}

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number
  isOperational: boolean
  details?: any

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}

export const api = axios.create({
  baseURL: API_URL,
})

// --- Centralized Error Handling ---
export const handleApiError = (error: AxiosError<ServerErrorResponse>) => {
  let message = 'An unexpected error occurred'
  let statusCode = 500
  let isOperational = false
  let details = null

  console.log(error, 'err')

  if (error.response) {
    // The request was made and the server responded with a status code
    const { data, status } = error.response
    message = data.message || message
    statusCode = status
    isOperational = data.isOperational ?? true
    details = data.details
  } else if (error.request) {
    // The request was made but no response was received
    message = 'No response from server. Please check your network connection.'
    statusCode = 0
  } else {
    // Something happened in setting up the request
    message = error.message
  }

  // We reject the promise with our custom error so React Query receives it
  return Promise.reject(
    new ApiError(message, statusCode, isOperational, details)
  )
}

// --- Interceptor (The Performance Win) ---
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Optional: You can automatically unwrap response.data here if you want
    // to avoid doing it in every service function.
    // For now, we return the full response to keep typing standard.

    return response
  },
  (error: AxiosError<ServerErrorResponse>) => handleApiError(error)
)
