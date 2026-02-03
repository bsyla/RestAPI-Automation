import { faker } from "@faker-js/faker";

const uniqueSuffix = () => faker.string.uuid().slice(0, 8);

export const dataFactory = {
  projectName: () => `qa-project-${faker.word.noun()}-${uniqueSuffix()}`,
  taskContent: () => `Automated task: ${faker.hacker.verb()} ${uniqueSuffix()}`,
  invalidId: () => `99999${faker.string.numeric(8)}`,
};
