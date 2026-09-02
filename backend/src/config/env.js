const requiredInProduction = ["MONGODB_URI", "JWT_SECRET"];

const validateEnvironment = () => {
    if (process.env.NODE_ENV !== "production") return;

    for (const name of requiredInProduction) {
        if (!process.env[name]) {
            throw new Error(`Missing required environment variable: ${name}`);
        }
    }
};

module.exports = { validateEnvironment };
