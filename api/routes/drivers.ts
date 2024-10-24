import express from "express";
import { Driver } from "../types/drivers.types";
import { PostgrestError } from "@supabase/supabase-js";
import { scrapeDrivers } from "../scraper";
import { supabase } from "../services/supabase";

export const driversRouter = express.Router();

driversRouter.get("/", async (req, res) => {
  try {
    let {
      data: drivers,
      error,
    }: { data: Driver[] | null; error: PostgrestError | null } = await supabase
      .from("drivers")
      .select("*");

    if (error || !drivers || drivers.length === 0) {
      const scrapedDrivers = await scrapeDrivers();

      const { error: insertError } = await supabase
        .from("drivers")
        .insert(scrapedDrivers);

      if (insertError) {
        throw new Error("Error saving drivers to database");
      }

      res.status(200).json(scrapedDrivers);
    } else {
      res.status(200).json(drivers);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve or scrape drivers" });
  }
});
