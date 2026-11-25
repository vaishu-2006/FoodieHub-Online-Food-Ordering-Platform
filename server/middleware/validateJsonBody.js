import { AppError } from '../utils/asyncHandler.js'

export function validateJsonBody(req, res, next) {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return next()
  if (!req.is('application/json')) return next(new AppError('Request body must use application/json.', 415))
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return next(new AppError('Request body must be a JSON object.', 400))
  }
  next()
}
