console.clear();

import express from "express";
import cors from "cors";

import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { teams } from "./assets/teams.js";
import { drivers } from "./assets/drivers.js";

const PORT = 3000;
const expressApp = express();

// enabling CORS for some specific origins only.
let corsOptions = {
	origin: ["http://localhost:5173"],
};

expressApp.use(express.static("public"));

// enabling CORS for any unknown origin
expressApp.use(cors(corsOptions));

// middleware
expressApp.use(express.json());

expressApp.get("/teams", (req, res) => {
	res.send(teams);
	res.end();
});

expressApp.get("/drivers/:team_name", (req, res) => {
	drivers[req.params.team_name]
		? res.send(drivers[req.params.team_name])
		: res.status(404).send({ message: "team_name does not exist" });

	res.end();
});

expressApp.listen(PORT, () => console.log(`Server listening in port ${PORT}`));
