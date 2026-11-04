import mongoose from 'mongoose';

/**
 * Log the real error server-side, return a generic message to the client
 * (avoids leaking MongoDB / OpenAI internals).
 */
export const serverError = (res, error, message = 'Something went wrong. Please try again.') => {
    console.error(error);
    if (error?.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    if (error?.code === 11000) {
        return res.status(409).json({ message: 'A record with these details already exists' });
    }
    return res.status(500).json({ message });
};

/** router.param handler: reject malformed ObjectIds with 400 instead of a CastError 500. */
export const validateObjectId = (req, res, next, value) => {
    if (!mongoose.isValidObjectId(value)) {
        return res.status(400).json({ message: 'Invalid id' });
    }
    next();
};

/** Copy only whitelisted keys that are present on `source`. */
export const pick = (source = {}, keys = []) =>
    keys.reduce((acc, key) => {
        if (Object.prototype.hasOwnProperty.call(source, key)) acc[key] = source[key];
        return acc;
    }, {});
