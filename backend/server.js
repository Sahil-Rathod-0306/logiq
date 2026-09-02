const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const { validateEnvironment } = require("./src/config/env");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        validateEnvironment();
        await connectDB();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
