import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";

const PORT = 3000;
const app = express();

// enabling CORS for some specific origins only.
let corsOptions = {
	origin: ["http://localhost:5173"],
};

app.use(express.static("public"));

// enabling CORS for known origin
app.use(cors(corsOptions));

// middleware
app.use(express.json());

app.get("/teams", (req, res) => {
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

				if (req.query["drivers"] === "yes") {
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
				}

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

app.get("/:team_name/drivers", (req, res) => {
	const url = "https://www.formula1.com/en/drivers.html";

	fetch(url)
		.then((response) => response.text())
		.then((text) => {
			const $ = cheerio.load(text);

			let drivers;

			$("div.driver a.listing-item--link").each((i, driverContainer) => {
				const driverDiv = $(driverContainer).children("fieldset");

				const teamName = $(driverDiv).children("p").text();

				const normalizedTeamName = teamName
					.split(" ")
					.join("-")
					.toLowerCase();

				if (req.params.team_name === normalizedTeamName) {
					if (drivers === undefined) {
						drivers = [];
					}

					let driver = {};
					driver["id"] = i;

					driver["team-color"] = $(driverContainer)
						.attr("style")
						.split(":")[1];

					const divListingStanding = $(driverDiv).children(
						"div.listing-standing"
					);

					driver["rank"] = $(divListingStanding)
						.children("div.rank")
						.text();
					driver["points"] = $(divListingStanding)
						.children("div.points")
						.children("div:first")
						.text();

					const divListingName = $(driverDiv)
						.children("div.container")
						.children("div")
						.children("div.listing-item--name");

					driver["first-name"] = $(divListingName)
						.children("span:first")
						.text();

					driver["last-name"] = $(divListingName)
						.children("span:last")
						.text();

					driver["name"] = [
						driver["first-name"],
						driver["last-name"],
					].join(" ");

					driver["team"] = teamName;

					driver["country-flag"] = $(driverDiv)
						.children("div.container")
						.children("div")
						.children("div.country-flag")
						.children("picture")
						.children("img")
						.attr("data-src");

					const divListingImage = $(driverDiv).children(
						"div.listing-item--image-wrapper"
					);

					driver["image"] = $(divListingImage)
						.children("picture.listing-item--photo")
						.children("img")
						.attr("data-src");

					driver["number-logo"] = $(divListingImage)
						.children("picture.listing-item--number")
						.children("img")
						.attr("data-src");

					drivers.push(driver);
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

app.get("/drivers", (req, res) => {
	const url = "https://www.formula1.com/en/drivers.html";

	fetch(url)
		.then((response) => response.text())
		.then((text) => {
			const $ = cheerio.load(text);

			let drivers = [];

			$("div.driver a.listing-item--link").each((i, driverContainer) => {
				let driver = {};
				driver["id"] = i;

				driver["team-color"] = $(driverContainer)
					.attr("style")
					.split(":")[1];

				const driverDiv = $(driverContainer).children("fieldset");

				const divListingStanding = $(driverDiv).children(
					"div.listing-standing"
				);

				driver["rank"] = $(divListingStanding)
					.children("div.rank")
					.text();
				driver["points"] = $(divListingStanding)
					.children("div.points")
					.children("div:first")
					.text();

				driver["team"] = $(driverDiv).children("p").text();

				const divListingName = $(driverDiv)
					.children("div.container")
					.children("div")
					.children("div.listing-item--name");

				driver["first-name"] = $(divListingName)
					.children("span:first")
					.text();

				driver["last-name"] = $(divListingName)
					.children("span:last")
					.text();

				driver["name"] = [
					driver["first-name"],
					driver["last-name"],
				].join(" ");

				driver["country-flag"] = $(driverDiv)
					.children("div.container")
					.children("div")
					.children("div.country-flag")
					.children("picture")
					.children("img")
					.attr("data-src");

				const divListingImage = $(driverDiv).children(
					"div.listing-item--image-wrapper"
				);

				driver["image"] = $(divListingImage)
					.children("picture.listing-item--photo")
					.children("img")
					.attr("data-src");

				driver["number-logo"] = $(divListingImage)
					.children("picture.listing-item--number")
					.children("img")
					.attr("data-src");

				drivers.push(driver);
			});

			res.send(drivers);
			res.end();
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send({ error_message: "Internal server error" });
		});
});

app.use((req, res) => {
	res.status(404).send({ error_message: "Route not found" });
	res.end();
});

app.listen(PORT, () => {
	console.log(`Server listening in port ${PORT}`);
});
