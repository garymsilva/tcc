import { expandToStringWithNL } from "langium";
import { Model } from "../../../../language/generated/ast.js";
import { parseTemplate } from "../../../util/generator-utils.js";
import { File, generateFile } from "../types.js";

const ModelTemplate = expandToStringWithNL`
package models

type {{upper_name}} struct{}
`

function buildModel(model: Model, data: () => Object = () => ({})): string {
	return parseTemplate(ModelTemplate, data())
}

export function GenerateModels(model: Model, target_folder: string) {
  for (let i = 0; i < model.types.length; i++) {
    const elem = model.types[i];
    const file = {
      relativePath: "/models",
      fileName: `${elem.name.toLowerCase()}.go`,
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
