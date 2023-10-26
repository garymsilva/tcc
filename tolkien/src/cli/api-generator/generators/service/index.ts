import { Service, Model } from "../../../../language/generated/ast.js";
import generatorConfig from "../../../config.js";
import { capitalizeString, parseTemplate } from "../../../util/generator-utils.js";
import { addDaos } from "../dao/index.js";
import { addMethods } from "../method/index.js";
import { File, generateFile } from "../types.js";
import { template } from "./template.js";

function buildService(model: Model, data: () => Object = () => ({})): string {
	return parseTemplate(template, data())
}

export function GenerateService(service: Service) {
  const name = service.name.toLowerCase();
  const file = {
    relativePath: `/services/${service.name}`,
    fileName: `${name}.go`,
    builder: buildService,
    data() {
      return {
        name,
      }
    }
  } as File;
  const path = generateFile(file, generatorConfig.targetFolder)
  addMethods(path, {
    interface: capitalizeString(name)+'Service',
    struct: 'service',
    key: 's',
    methods: service.methods,
  })
  addDaos(path, {
    struct: 'service',
    daos: service.daos,
  })
}

export function GenerateServices(services: Array<Service>) {
  services.forEach(service => { GenerateService(service) })
}
