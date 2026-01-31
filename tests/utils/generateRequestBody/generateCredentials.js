import { createRequire } from "module";
const require = createRequire(import.meta.url);
const accountRequestBody = require("../../data/projects/create_project.json");
import { faker } from "@faker-js/faker";

export async function generateCreateProjectRequestBody() {
  const color_palete = [
    "berry_red",
    "red",
    "orange",
    "yellow",
    "olive_green",
    "lime_green",
    "green",
    "mint_green",
    "teal",
    "sky_blue",
    "light_blue",
    "blue",
    "grape",
    "violet",
    "lavender",
    "magenta",
    "salmon",
    "charcoal",
    "grey",
    "taupe",
  ];
  const body = { ...accountRequestBody };
  body.name = faker.airline.airline().name;
  body.color = color_palete[Math.floor(Math.random() * color_palete.length)];
  return body;
}
