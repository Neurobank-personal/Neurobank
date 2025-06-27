const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack)

    // API key errors
    if (err.message.includes('OPENAI_API_KEY')) {
        return res.status(500).json({
            error: 'OpenAI API-nyckel saknas eller ogiltig',
            code: 'OPENAI_API_KEY_ERROR'
        })
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Valideringsfel',
            details: err.message,
            code: 'VALIDATION_ERROR'
        })
    }

    // Not found errors
    if (err.message.includes('hittades inte')) {
        return res.status(404).json({
            error: err.message,
            code: 'NOT_FOUND'
        })
    }

    // Duplicate errors
    if (err.message.includes('finns redan')) {
        return res.status(409).json({
            error: err.message,
            code: 'DUPLICATE_ERROR'
        })
    }

    // Default server error
    res.status(500).json({
        error: 'Något gick fel på servern',
        code: 'INTERNAL_SERVER_ERROR'
    })
}

const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Endpoint hittades inte',
        path: req.path,
        method: req.method,
        code: 'ENDPOINT_NOT_FOUND'
    })
}

module.exports = {
    errorHandler,
    notFoundHandler
}
