console.clear();

import express from "express";

const PORT = 3000;
const expressApp = express();

// middleware
expressApp.use(express.json());
expressApp.use(express.text());

expressApp.get("/", (req, res) => {
	res.send("Welcome to F1 API !!!");
});

expressApp.get("/account/:id_account", (req, res) => {
	res.send(`Account id: ${req.params.id_account}`);
});

expressApp.get("/test-not-authorized", (req, res) => {
	res.status(401).send({
		errorMessage: "Not authorized",
	});
});

expressApp.post("/my-account", (req, res) => {
	res.send(req.body);
});

expressApp.listen(PORT, () => console.log(`Server listening in port ${PORT}`));
