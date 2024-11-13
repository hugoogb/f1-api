import { Router } from "express";
import { Driver } from "../types/drivers.types";
import { PostgrestError } from "@supabase/supabase-js";
import { scrapeDrivers } from "../scraper";
import { supabase } from "../services/supabase";

export const driversRouter = Router();

driversRouter.get("/", async (req, res) => {
  try {
    let {
      data: drivers,
      error,
    }: { data: Driver[] | null; error: PostgrestError | null } = await supabase
      .from("drivers")
      .select("*")
      .order("lastName", { ascending: true });

    if (error) throw error;

    const ids: number[] = drivers?.map((driver) => driver.id) || [];

    const scrapedDrivers = await scrapeDrivers();
    scrapedDrivers.sort((a, b) => a.lastName.localeCompare(b.lastName));

    const isDifferent =
      !drivers ||
      drivers.length !== scrapedDrivers.length ||
      drivers.some((driver) => {
        const scrapedDriver = scrapedDrivers.find(
          (d) =>
            d.firstName === driver.firstName && d.lastName === driver.lastName
        );
        return (
          !scrapedDriver ||
          driver.rank !== scrapedDriver.rank ||
          driver.points !== scrapedDriver.points ||
          driver.team !== scrapedDriver.team ||
          driver.countryFlag !== scrapedDriver.countryFlag ||
          driver.image !== scrapedDriver.image ||
          driver.numberLogo !== scrapedDriver.numberLogo
        );
      });

    if (isDifferent) {
      const { error: deleteError } = await supabase
        .from("drivers")
        .delete()
        .in("id", ids);
      if (deleteError) throw new Error("Error deleting old drivers");

      const { error: insertError } = await supabase
        .from("drivers")
        .insert(scrapedDrivers);
      if (insertError) throw new Error("Error saving new drivers to database");

      res.status(200).json(scrapedDrivers);
    } else {
      res.status(200).json(drivers);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve or scrape drivers" });
  }
});
