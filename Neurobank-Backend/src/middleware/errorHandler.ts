import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error('Error:', err.stack);

    // API key errors
    if (err.message.includes('OPENAI_API_KEY')) {
        res.status(500).json({
            error: 'OpenAI API-nyckel saknas eller ogiltig',
            code: 'OPENAI_API_KEY_ERROR'
        });
        return;
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        res.status(400).json({
            error: 'Valideringsfel',
            details: err.message,
            code: 'VALIDATION_ERROR'
        });
        return;
    }

    // Not found errors
    if (err.message.includes('hittades inte')) {
        res.status(404).json({
            error: err.message,
            code: 'NOT_FOUND'
        });
        return;
    }

    // Duplicate errors
    if (err.message.includes('finns redan')) {
        res.status(409).json({
            error: err.message,
            code: 'DUPLICATE_ERROR'
        });
        return;
    }

    // Default server error
    res.status(500).json({
        error: 'Något gick fel på servern',
        code: 'INTERNAL_SERVER_ERROR'
    });
};

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        error: 'Endpoint hittades inte',
        path: req.path,
        method: req.method,
        code: 'ENDPOINT_NOT_FOUND'
    });
};