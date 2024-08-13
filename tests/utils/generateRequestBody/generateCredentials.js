import accountRequestBody from "../../data/projects/create_project.json" assert { type: "json" };
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
  accountRequestBody.name = faker.airline.airline().name;
  accountRequestBody.color =
    color_palete[Math.floor(Math.random() * color_palete.length)];

  return accountRequestBody;
}
