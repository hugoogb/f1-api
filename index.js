import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";

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

	fetch(url)
		.then((response) => response.text())
		.then((text) => {
			const $ = cheerio.load(text);

			let teams = [];

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
				team["logo"] = $(divListingInfo)
					.children("div.logo")
					.children("picture.team-car")
					.children("img")
					.attr("data-src");

				const divListingImage =
					$(teamDiv).children("div.listing-image");

				team["image"] = $(divListingImage)
					.children("picture.team-car")
					.children("img")
					.attr("data-src");

				teams.push(team);
			});

			res.send(teams);
			res.end();
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send({ error_message: "Internal server error" });
		});
});

expressApp.get("/drivers/:team_name", (req, res) => {
	const url = "https://www.formula1.com/en/teams.html";

	fetch(url)
		.then((response) => response.text())
		.then((text) => {
			const $ = cheerio.load(text);

			let drivers;

			$(
				"div.team-listing a.listing-link > fieldset.listing-item-wrapper > div.listing-item"
			).each((i, teamDiv) => {
				const divListingInfo = $(teamDiv).children("div.listing-info");

				const teamName = $(divListingInfo)
					.children("div.name")
					.children("span:last")
					.text();

				const normalizedTeamName = teamName
					.split(" ")
					.join("-")
					.toLowerCase();

				if (normalizedTeamName === req.params.team_name) {
					drivers = [];

					const divListingTeamDrivers = $(teamDiv).children(
						"div.listing-team-drivers"
					);

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

							driver["image"] = $(driverDiv)
								.children("div.driver-image")
								.children("picture")
								.children("img")
								.attr("data-src");

							drivers.push(driver);
						});
				}
			});

			drivers === undefined
				? res.status(404).send({
						error_message:
							"Used parameter team_name does not exist",
				  })
				: res.send(drivers);
			res.end();
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send({ error_message: "Internal server error" });
		});
});

expressApp.listen(PORT, () => {
	console.clear();
	console.log(`Server listening in port ${PORT}`);
});
