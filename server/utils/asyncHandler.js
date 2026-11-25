export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next)

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
  }
}

export const requireFields = (values) => {
  for (const [label, value] of Object.entries(values)) {
    if (typeof value !== 'string' || !value.trim()) throw new AppError(`${label} is required.`)
  }
}
