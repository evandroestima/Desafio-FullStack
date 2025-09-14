import express from "express";
import cors from "cors";
import { initializeDatabase } from "./dbConnection";
import apiRoutes from "./routes";

const app = express();
const port = 3000;

// Middleware to parse JSON bodies and enable CORS
app.use(cors());
app.use(express.json());

app.use(apiRoutes);

// Start the server after the database and tables are initialized
(async () => {
  try {
    // Wait for the database to be initialized before starting the server
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`Backend server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }
})();
