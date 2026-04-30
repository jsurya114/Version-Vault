"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
            return;
        }
        req.body = result.data;
        next();
    };
};
exports.validate = validate;
