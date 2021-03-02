const ApiError = require('../errors/ApiError');

function validateDto(schema) {
    return async (req, res, next) => {
        try {
            const validatedBody = await schema.validate(req.body);
            req.body = validatedBody;
            next();
        } catch (error) {
            next(ApiError.badRequest(error));
        }
    };
}

module.exports = validateDto;
