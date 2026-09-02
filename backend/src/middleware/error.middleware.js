const errorHandler = (error, req, res, next) => {
    console.error("Unhandled request error:", error.message);

    if (error.type === "entity.too.large") {
        return res.status(413).json({ success: false, message: "Request body is too large" });
    }
    if (error instanceof SyntaxError && "body" in error) {
        return res.status(400).json({ success: false, message: "Malformed JSON request body" });
    }
    return res.status(error.status || 500).json({
        success: false,
        message: error.status && error.status < 500 ? error.message : "Internal server error"
    });
};

module.exports = { errorHandler };
