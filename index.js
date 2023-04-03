console.clear();

import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";

import { drivers } from "./assets/drivers.js";

const PORT = 3000;
const expressApp = express();

// enabling CORS for some specific origins only.
let corsOptions = {
	origin: ["http://localhost:5173"],
};

expressApp.use(express.static("public"));

// enabling CORS for known origin
expressApp.use(cors(corsOptions));

// middleware
expressApp.use(express.json());

expressApp.get("/teams", (req, res) => {
	const url = "https://www.formula1.com/en/teams.html";

	let teams = [];

	fetch(url)
		.then((response) => response.text())
		.then((text) => {
			const $ = cheerio.load(text);

			$(
				"div.team-listing a.listing-link > fieldset.listing-item-wrapper > div.listing-item"
			).each((i, teamDiv) => {
				let team = {};
				team["id"] = i;

				const divListingStanding = $(teamDiv).children(
					"div.listing-standing"
				);

				team["rank"] = $(divListingStanding)
					.children("div.rank")
					.text();
				team["points"] = $(divListingStanding)
					.children("div.points")
					.children("div:first")
					.text();

				const divListingInfo = $(teamDiv).children("div.listing-info");

				team["color"] = $(divListingInfo).attr("style").split(":")[1];
				team["name"] = $(divListingInfo)
					.children("div.name")
					.children("span:last")
					.text();
				team["logo-url"] = $(divListingInfo)
					.children("div.logo")
					.children("picture.team-car")
					.children("img")
					.attr("data-src");

				const divListingTeamDrivers = $(teamDiv).children(
					"div.listing-team-drivers"
				);

				team["drivers"] = [];
				$(divListingTeamDrivers)
					.children("div.driver")
					.each((i, driverDiv) => {
						let driver = {};

						driver["first-name"] = $(driverDiv)
							.children("div.driver-info")
							.children("span.first-name")
							.text();

						driver["last-name"] = $(driverDiv)
							.children("div.driver-info")
							.children("span.last-name")
							.text();

						driver["name"] = [
							driver["first-name"],
							driver["last-name"],
						].join(" ");

						team["drivers"].push(driver);
					});

				const divListingImage =
					$(teamDiv).children("div.listing-image");

				team["img-url"] = $(divListingImage)
					.children("picture.team-car")
					.children("img")
					.attr("data-src");

				teams.push(team);
			});

			res.send(teams);
			res.end();
		});
});

expressApp.get("/drivers/:team_name", (req, res) => {
	const $ = cheerio
		.fromURL("https://www.formula1.com/en/drivers.html")
		.then((response) => console.log(response.text()));
	drivers[req.params.team_name]
		? res.send(drivers[req.params.team_name])
		: res.status(404).send({ message: "team_name does not exist" });

	res.end();
});

expressApp.listen(PORT, () => console.log(`Server listening in port ${PORT}`));
