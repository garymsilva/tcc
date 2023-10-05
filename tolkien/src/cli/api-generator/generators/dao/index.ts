import { Dao, Model } from "../../../../language/generated/ast.js";
import config from "../../../config.js";
import { parseTemplate } from "../../../util/generator-utils.js";
import { File, generateFile } from "../types.js";
import { template } from "./template.js";

function buildModel(model: Model, data: () => Object = () => ({})): string {
	return parseTemplate(template, data())
}

export function GenerateDao(dao: Dao) {
  const file = {
    relativePath: "/models/dao",
    fileName: `${dao.name.toLowerCase()}.dao.go`,
    builder: buildModel,
    data() {
      return {
        name: dao.name.toLowerCase(),
      }
    }
  } as File;
  generateFile(file, config.targetFolder)
}

export function GenerateDaos(daos: Array<Dao>) {
  daos.forEach(dao => { GenerateDao(dao) })
}
