import fs from "fs";
import yaml from "js-yaml";

export const parseBuildConfig = (filePath) => {
  const file = fs.readFileSync(filePath, "utf-8");
  return yaml.load(file);
};
