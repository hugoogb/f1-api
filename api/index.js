import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import teamsRouter from "./routes/teams.js";
import driversRouter from "./routes/drivers.js";
import morgan from "morgan";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// enabling CORS for some specific origins only.
let corsOptions = {
	origin: ["http://localhost:5173"],
};

// enabling CORS for known origin
app.use(cors(corsOptions));

// middleware
app.use(morgan("dev"));
app.use(express.json());
app.use("/teams", teamsRouter);
app.use("/drivers", driversRouter);

// static "home /" page
app.use(express.static("public"));

app.use((req, res) => {
	res.status(404).send({ error_message: "Route not found" });
	res.end();
});

app.listen(PORT, () => {
	console.clear();
	console.log(`Server listening in port ${PORT}`);
});
