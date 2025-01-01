import rateLimit from 'express-rate-limit';


export const LoginLimiter = rateLimit({
    windowMs: 60000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false
})