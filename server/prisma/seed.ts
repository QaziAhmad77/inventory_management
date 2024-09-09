import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();


// const modelNames = orderedFileNames.map((fileName) => { ... }): This maps over the file names and converts them to model names that match the Prisma models.
// path.basename(fileName, path.extname(fileName)): Extracts the file name without the extension (e.g., "products" from "products.json").
// console.log(modelName, "modelName");: Logs the extracted model name.
// return modelName.charAt(0).toUpperCase() + modelName.slice(1);: Converts the first character of the model name to uppercase (e.g., "Products" from "products").

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    console.log(modelName, "modelName");
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });
  console.log(modelNames, "modelNames");
  for (const modelName of modelNames) {
    const model: any = prisma[modelName as keyof typeof prisma];
    console.log(model, "model");
    if (model) {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } else {
      console.error(
        `Model ${modelName} not found. Please ensure the model name is correctly specified.`
      );
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");
  console.log(dataDirectory, "dataDirectory");
  const orderedFileNames = [
    "products.json",
    "expenseSummary.json",
    "sales.json",
    "salesSummary.json",
    "purchases.json",
    "purchaseSummary.json",
    "users.json",
    "expenses.json",
    "expenseByCategory.json",
  ];

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    console.log(filePath, "filePath");
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    console.log(jsonData, "jsonData");
    const modelName = path.basename(fileName, path.extname(fileName));
    console.log(modelName, "modelName");
    const model: any = prisma[modelName as keyof typeof prisma];
    console.log(model, "model");

    if (!model) {
      console.error(`No Prisma model matches the file name: ${fileName}`);
      continue;
    }

    for (const data of jsonData) {
      await model.create({
        data,
      });
    }

    console.log(`Seeded ${modelName} with data from ${fileName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
