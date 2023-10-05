import { Domain, Model } from "../../../../language/generated/ast.js";
import { parseTemplate } from "../../../util/generator-utils.js";
import { File, generateFile } from "../types.js";
import config from "../../../config.js";
import { template } from "./template.js";

function buildDomain(model: Model, data: () => Object = () => ({})): string {
	return parseTemplate(template, data())
}

function GenerateModel(model: Domain) {
  const file = {
    relativePath: "/models",
    fileName: `${model.name.toLowerCase()}.go`,
    builder: buildDomain,
    data() {
      return {
        name: model.name.toLowerCase(),
      }
    }
  } as File;
  generateFile(file, config.targetFolder)
}

export function GenerateDomain(domain: Array<Domain>) {
  domain.forEach(model => GenerateModel(model))
}
