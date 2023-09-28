import { Model } from "../../../../language/generated/ast.js";
import { parseTemplate } from "../../../util/generator-utils.js";
import { File, generateFile } from "../types.js";
import { Dao } from "./template.js";

function buildModel(model: Model, data: () => Object = () => ({})): string {
	return parseTemplate(Dao, data())
}

export function GenerateDaos(model: Model, target_folder: string) {
  for (let i = 0; i < model.daos.length; i++) {
    const elem = model.daos[i];
    const file = {
      relativePath: "/models/dao",
      fileName: `${elem.name.toLowerCase()}.dao.go`,
      builder: buildModel,
      data() {
        return {
          name: elem.name.toLowerCase(),
        }
      }
    } as File;
    generateFile(file, model, target_folder)
  }
}
