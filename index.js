console.clear();

import express from "express";

import { teams } from "./assets/teams.js";
import { drivers } from "./assets/drivers.js";

const PORT = 3000;
const expressApp = express();

// middleware
expressApp.use(express.json());

expressApp.get("/", (req, res) => {
	res.send("Welcome to F1 API !!!");
	res.end();
});

expressApp.get("/teams", (req, res) => {
	res.send(teams);
	res.end();
});

expressApp.get("/drivers/:team_name", (req, res) => {
	res.send(drivers[req.params.team_name]);
	res.end();
});

expressApp.listen(PORT, () => console.log(`Server listening in port ${PORT}`));
