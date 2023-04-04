import express from "express";
import * as cheerio from "cheerio";

const teamsRouter = express.Router();

teamsRouter.get("/", (req, res) => {
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

export default teamsRouter;
