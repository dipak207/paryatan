import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import destinationRoutes from "./routes/destination";
import favoritesRoutes from "./routes/favorites";
import visitedRoutes from "./routes/visited";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (_req, res) => res.json({ success: true, message: "Paryatan API" }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", destinationRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/visited", visitedRoutes);

app.use(errorHandler);

export { app };
