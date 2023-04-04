import express from "express";
import * as cheerio from "cheerio";

const driversRouter = express.Router();

driversRouter.get("/", (req, res) => {
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

driversRouter.get("/:team_name", (req, res) => {
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

export default driversRouter;
