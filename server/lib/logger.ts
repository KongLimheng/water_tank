// server/lib/logger.ts
export const createLogger = () => {
  return {
    log: (...args: any[]) => {
      process.stdout.write(
        `${new Date().toISOString()} [LOG] ${args.join(' ')}\n`
      )
    },
    error: (...args: any[]) => {
      process.stderr.write(
        `${new Date().toISOString()} [ERROR] ${args.join(' ')}\n`
      )
    },
    warn: (...args: any[]) => {
      process.stdout.write(
        `${new Date().toISOString()} [WARN] ${args.join(' ')}\n`
      )
    },
    info: (...args: any[]) => {
      process.stdout.write(
        `${new Date().toISOString()} [INFO] ${args.join(' ')}\n`
      )
    },
    debug: (...args: any[]) => {
      if (process.env.NODE_ENV === 'development') {
        process.stdout.write(
          `${new Date().toISOString()} [DEBUG] ${args.join(' ')}\n`
        )
      }
    },
  }
}

export const logger = createLogger()
