// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const morgan = require("morgan");
// const { generalLimiter } = require("./middleware/rateLimit.middleware");
// const { errorHandler } = require("./middleware/error.middleware");
// const { notFound } = require("./middleware/notFound.middleware");
// const logRoutes = require("./routers/log.routers");
// const authRoutes = require("./routers/auth.routers");
// const adminRoutes = require("./routers/admin.routers");
// const incidentRoutes = require("./routers/incident.routers");
// const notificationRoutes = require("./routers/notification.routers");

// const app = express();
// const isProduction = process.env.NODE_ENV === "production";
// const configuredFrontend = process.env.FRONTEND_URL;
// const allowedOrigins = isProduction
//     ? [configuredFrontend].filter(Boolean)
//     : ["http://localhost:3000", "http://localhost:3001", configuredFrontend].filter(Boolean);

// if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);

// app.disable("x-powered-by");
// app.use(helmet({ hsts: isProduction ? undefined : false }));
// app.use(cors({
//     origin(origin, callback) {
//         if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
//         const error = new Error("Origin is not allowed by CORS");
//         error.status = 403;
//         return callback(error);
//     },
//     credentials: true
// }));
// app.use(express.json({ limit: "100kb" }));
// app.use(morgan(":method :url :status :response-time ms"));

// app.get("/", (req, res) => res.json({ success: true, message: "LogIQ API is running" }));
// app.use("/api", generalLimiter);
// app.use("/api/auth", authRoutes);
// app.use("/api/logs", logRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/incidents", incidentRoutes);
// app.use("/api/notifications", notificationRoutes);

// app.use(notFound);
// app.use(errorHandler);

// module.exports = app;
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { generalLimiter } = require("./middleware/rateLimit.middleware");
const { errorHandler } = require("./middleware/error.middleware");
const { notFound } = require("./middleware/notFound.middleware");

const logRoutes = require("./routers/log.routers");
const authRoutes = require("./routers/auth.routers");
const adminRoutes = require("./routers/admin.routers");
const incidentRoutes = require("./routers/incident.routers");
const notificationRoutes = require("./routers/notification.routers");

const app = express();

const isProduction = process.env.NODE_ENV === "production";

const configuredFrontend = process.env.FRONTEND_URL;

const allowedOrigins = isProduction
    ? [configuredFrontend].filter(Boolean)
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        configuredFrontend
    ].filter(Boolean);

if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(
    helmet({
        hsts: isProduction ? undefined : false
    })
);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            const error = new Error("Origin is not allowed by CORS");
            error.status = 403;

            return callback(error);
        },
        credentials: true
    })
);

app.use(express.json({ limit: "100kb" }));

app.use(
    morgan(":method :url :status :response-time ms")
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "LogIQ API is running"
    });
});

/*
|--------------------------------------------------------------------------
| Rate Limiter
|--------------------------------------------------------------------------
*/

app.use("/api", generalLimiter);

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

app.use("/api/logs", logRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/incidents", incidentRoutes);

app.use("/api/notifications", notificationRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(notFound);

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

module.exports = app;