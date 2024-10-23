import { Router } from "express";
import { scrapeTeams } from "../scraper";
import { supabase } from "../services/supabase";
import { Team } from "../types/teams.types";
import { PostgrestError } from "@supabase/supabase-js";

export const teamsRouter = Router();

teamsRouter.get("/", async (req, res) => {
  try {
    let {
      data: teams,
      error,
    }: { data: Team[] | null; error: PostgrestError | null } = await supabase
      .from("teams")
      .select("*");

    if (error || !teams || teams.length === 0) {
      const scrapedTeams = await scrapeTeams();

      const { error: insertError } = await supabase
        .from("teams")
        .insert(scrapedTeams);

      if (insertError) {
        throw new Error("Error saving teams to database");
      }

      res.status(200).json(scrapedTeams);
    } else {
      res.status(200).json(teams);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve or scrape teams" });
  }
});

// teamsRouter.get("/:team_name", (req, res) => {
//   const url = `https://www.formula1.com/en/teams/${req.params.team_name}.html`;

//   fetch(url)
//     .then((response) => response.text())
//     .then((text) => {
//       const $ = cheerio.load(text);

//       let team = {};

//       team["name"] = $("main.template-team-details").attr("pagename");

//       const teamHeader = $("main.template-team-details header.team-details");

//       const statsSection = $(teamHeader)
//         .children("section.stats")
//         .children("div.team-stats");

//       team["logo"] = $(statsSection)
//         .children("section.extra-info")
//         .children("div.brand-logo")
//         .children("img")
//         .attr("src");

//       const statsTable = $(statsSection)
//         .children("table.stat-list")
//         .children("tbody")
//         .children("tr");

//       $(statsTable).each((i, stat) => {
//         const statKey = $(stat)
//           .children("th.stat-key")
//           .children("span.text")
//           .text()
//           .split(" ")
//           .join("-")
//           .toLowerCase();

//         const statValue = $(stat).children("td.stat-value").text();

//         team[statKey] = statValue;
//       });

//       res.send(team);
//       res.end();
//     });
// });
