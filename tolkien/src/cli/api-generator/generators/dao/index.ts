import { Dao, Model } from "../../../../language/generated/ast.js";
import generatorConfig from "../../../config.js";
import { capitalizeString, parseTemplate } from "../../../util/generator-utils.js";
import { addMethods } from "../method/index.js";
import { File, generateFile } from "../types.js";
import * as template from "./template.js";

function buildModel(model: Model, data: () => Object = () => ({})): string {
	return parseTemplate(template.Dao, data())
}

export function GenerateDao(dao: Dao) {
  const name = dao.name.toLowerCase();
  const file = {
    relativePath: "/models/dao",
    fileName: `${name}.dao.go`,
    builder: buildModel,
    data(): { name: string } {
      return {
        name,
      }
    }
  } as File;
  const path = generateFile(file, generatorConfig.targetFolder)
  addMethods(path, {
    interface: capitalizeString(name)+'Dao',
    struct: name+'Dao',
    key: 'd',
    methods: dao.methods,
  })
}

export function GenerateDaos(daos: Array<Dao>) {
  daos.forEach(dao => {
    GenerateDao(dao)
  })
}
