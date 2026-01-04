import bcrypt from 'bcryptjs'
import { NextFunction, Request, Response } from 'express'

export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword)
}

export async function hashPassword(plainPassword: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(plainPassword, saltRounds)
}

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
