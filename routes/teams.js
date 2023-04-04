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

				team["logo-small"] = $(divListingInfo)
					.children("div.logo")
					.children("picture.team-car")
					.children("img")
					.attr("data-src");

				const divListingImage =
					$(teamDiv).children("div.listing-image");

				team["image-car"] = $(divListingImage)
					.children("picture.team-car")
					.children("img")
					.attr("data-src");

				teams.push(team);
			});

			res.send(teams);
			res.end();
		});
});

teamsRouter.get("/:team_name", (req, res) => {
	const teamName = req.params.team_name.split("-");

	const normalizedTeamName = teamName
		.map((word) => {
			return word[0].toUpperCase() + word.substring(1);
		})
		.join("-");

	const url = `https://www.formula1.com/en/teams/${normalizedTeamName}.html`;

	fetch(url)
		.then((response) => response.text())
		.then((text) => {
			const $ = cheerio.load(text);

			let team = {};

			team["name"] = $("main.template-team-details").attr("pagename");

			const teamHeader = $(
				"main.template-team-details header.team-details"
			);

			const statsSection = $(teamHeader)
				.children("section.stats")
				.children("div.team-stats");

			team["logo"] = $(statsSection)
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

				team[statKey] = statValue;
			});

			res.send(team);
			res.end();
		});
});

export default teamsRouter;
