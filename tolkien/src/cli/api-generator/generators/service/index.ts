import { Service, Model } from "../../../../language/generated/ast.js";
import config from "../../../config.js";
import { parseTemplate } from "../../../util/generator-utils.js";
import { File, generateFile } from "../types.js";
import { template } from "./template.js";

function buildService(model: Model, data: () => Object = () => ({})): string {
	return parseTemplate(template, data())
}

export function GenerateDao(service: Service) {
  const file = {
    relativePath: `/services/${service.name}`,
    fileName: `${service.name.toLowerCase()}.go`,
    builder: buildService,
    data() {
      return {
        name: service.name.toLowerCase(),
      }
    }
  } as File;
  generateFile(file, config.targetFolder)
}

export function GenerateServices(services: Array<Service>) {
  services.forEach(service => { GenerateDao(service) })
}
