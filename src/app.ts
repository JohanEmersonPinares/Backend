import express from "express";
import cors from "cors";
import foodRouter from "../routes/foodRoute";
import userRouter from "../routes/userRoute";
import "dotenv/config";
import orderRouter from "../routes/orderRoute";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/app/order",orderRouter);
app.use("/uploads", express.static("uploads"));
export default app;
