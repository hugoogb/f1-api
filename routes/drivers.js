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
		});
});

driversRouter.get("/profile/:driver_name", (req, res) => {
	// TODO : handle incorrect names
	const url = `https://www.formula1.com/en/drivers/${req.params.driver_name}.html`;

	fetch(url)
		.then((response) => response.text())
		.then((text) => {
			const $ = cheerio.load(text);

			let driver = {};

			const driverHeader = $(
				"main.template-driverdetails header.driver-details"
			);

			const figureDriver = $(driverHeader)
				.children("section.profile")
				.children("div")
				.children("figure.driver-title");

			driver["image"] = $(figureDriver)
				.children("div.driver-main-image")
				.children("div.driver-image-crop-outer")
				.children("div.driver-image-crop-inner")
				.children("div.fom-adaptiveimage")
				.attr("data-path");

			driver["number"] = $(figureDriver)
				.children("figcaption.driver-details")
				.children("div.driver-number")
				.children("span:first")
				.text();

			driver["flag-icon"] = $(figureDriver)
				.children("figcaption.driver-details")
				.children("div.driver-number")
				.children("span.icn-flag")
				.children("img")
				.attr("src");

			driver["name"] = $(figureDriver)
				.children("figcaption.driver-details")
				.children("h1.driver-name")
				.text()
				.split("\n")[1]
				.trim();

			const statsSection = $(driverHeader)
				.children("section.stats")
				.children("div.driver-stats");

			driver["helmet-image"] = $(statsSection)
				.children("section.extra-info")
				.children("div.brand-logo")
				.children("img")
				.attr("src");

			const statsTable = $(statsSection)
				.children("table.stat-list")
				.children("tbody")
				.children("tr");

			$(statsTable).each((i, stat) => {
				const statKey = $(stat)
					.children("th.stat-key")
					.children("span.text")
					.text()
					.split(" ")
					.join("-")
					.toLowerCase();

				const statValue = $(stat).children("td.stat-value").text();

				driver[statKey] = statValue;
			});

			res.send(driver);
			res.end();
		});
});

export default driversRouter;
