import { toString } from "langium";
import { Service, Model } from "../../../../language/generated/ast.js";
import generatorConfig from "../../../config.js";
import { capitalizeString, parseTemplate, readFileAsStringArr } from "../../../util/generator-utils.js";
import { addDaos } from "../dao/index.js";
import { addMethods } from "../method/index.js";
import { File, generateFile } from "../types.js";
import * as template from "./template.js";
import { writeFileSync } from "fs";

function buildService(model: Model, data: () => Object = () => ({})): string {
	return parseTemplate(template.Service, data())
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
  addServices(path, {
    struct: 'service',
    services: service.services,
  });
  addDaos(path, {
    struct: 'service',
    daos: service.daos,
  })
}

export function GenerateServices(services: Array<Service>) {
  services.forEach(service => { GenerateService(service) })
}

export type ServiceParams = {
  struct: string
  services: Array<Service>
}

export function addServices (path: string, params: ServiceParams) {
  // read file
  let lines = readFileAsStringArr(path);

  // parse all templates
  const parsed = params.services.map(service => {
    const data = { name: service.name };
    return {
      import: parseTemplate(template.ServiceImport, data),
      var: parseTemplate(template.ServiceVar, data),
      attribute: parseTemplate(template.ServiceAttribute, data),
      init: parseTemplate(template.ServiceInit, data).split("\n").map(l => "\t"+l+"\n").join(""),
      inject: parseTemplate(template.ServiceInject, data),
    }
  })

  const servicesToAdd = parsed.filter(service => {
    return !lines.some(line => line.includes(service.import.slice(0, -1)));
  });

  if (servicesToAdd.length == 0) {
    return
  }

  // put vars
  let importClose = lines.findIndex((line) => line.includes("import ("))+1;
  while (lines[importClose] != ')') importClose++;

  lines = [
    ...lines.slice(0, importClose),
    ...servicesToAdd.map(s => "\t"+s.import.trimEnd()),
    ...lines.slice(importClose)
  ];

  // put vars
  let varClose = lines.findIndex((line) => line.includes("var ("))+1;
  while (lines[varClose] != ')') varClose++;

  lines = [
    ...lines.slice(0, varClose),
    ...servicesToAdd.map(s => "\t"+s.var.trimEnd()),
    ...lines.slice(varClose)
  ];

  // put attributes in struct
  let structClose = lines.findIndex((line) => line.includes("struct {"))+1;
  while (!lines[structClose].includes('instrumentable.Instrumented')) structClose++;

  lines = [
    ...lines.slice(0, structClose),
    ...servicesToAdd.map(s => "\t"+s.attribute.trimEnd()),
    ...lines.slice(structClose)
  ];

  // put inits in constructor
  let constructorClose = lines.findIndex((line) => line.includes(`return &${params.struct}{`));
  lines = [
    ...lines.slice(0, constructorClose),
    ...servicesToAdd.map(s => s.init.trimEnd()),
    ...lines.slice(constructorClose)
  ];

  // put injects
  let returnClose = lines.findIndex((line) => line.includes(`return &${params.struct}{`))+1;
  while (lines[returnClose] != '\t}') returnClose++;

  lines = [
    ...lines.slice(0, returnClose),
    ...servicesToAdd.map(s => "\t\t"+s.inject.trimEnd()),
    ...lines.slice(returnClose)
  ];

  // write file
  const joined = lines.join("\n")
  writeFileSync(path, toString(joined), { encoding: 'utf-8' });
}