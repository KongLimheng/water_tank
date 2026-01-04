import axios, { AxiosError } from 'axios'

const API_URL = process.env.API_URL || 'http://localhost:5000/api'

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
  // headers: {
  //   'Content-Type': 'application/json',
  // },
})

// Helper to handle server errors
export const handleApiError = (
  error: AxiosError<ServerErrorResponse>
): never => {
  if (error.response) {
    // Server responded with error status
    const { data, status } = error.response

    // Throw custom ApiError with server message
    throw new ApiError(
      data.message || 'An error occurred',
      status,
      data.isOperational ?? true,
      data.details
    )
  } else if (error.request) {
    // Request was made but no response received
    throw new ApiError(
      'No response from server. Please check your network connection.',
      0,
      false
    )
  } else {
    // Something happened in setting up the request
    throw new ApiError(error.message, 0, false)
  }
}
