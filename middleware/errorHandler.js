const errorHandler = (err, req, res, next) => {
    console.error("Middleware Error Handling:", err); // Log the error details
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Something went wrong';
    const stack = process.env.NODE_ENV === 'development' ? err.stack : {}; // Include stack trace only in development

    res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMsg,
        stack: stack
    });
}

module.exports = errorHandler;






