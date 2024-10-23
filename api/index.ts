import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { teamsRouter } from "./routes/teams";
import { driversRouter } from "./routes/drivers";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const app = express();

// enabling CORS for some specific origins only.
// let corsOptions = {
// 	origin: [
// 		"https://f1-showcase.vercel.app/",
// 		"https://f1-showcase-hugoogb.vercel.app/",
// 		"https://f1-showcase-git-master-hugoogb.vercel.app/",
// 	],
// };

// enabling CORS for known origin
// app.use(cors(corsOptions));

// enabling CORS for all origins
app.use(cors());

// middleware
app.use(morgan("dev"));
app.use(express.json());
app.use("/api/teams", teamsRouter);
app.use("/api/drivers", driversRouter);

// static "home /" page
app.use(express.static("public"));

app.use((req, res) => {
  res.status(404).send({ error_message: "Route not found" });
  res.end();
});

app.listen(PORT, () => {
  console.log(`Server listening in port ${PORT}`);
});
