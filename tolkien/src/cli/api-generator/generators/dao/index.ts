import { toString } from "langium";
import { Dao, Model } from "../../../../language/generated/ast.js";
import generatorConfig from "../../../config.js";
import { capitalizeString, parseTemplate, readFileAsStringArr } from "../../../util/generator-utils.js";
import { addMethods } from "../method/index.js";
import { File, generateFile } from "../types.js";
import * as template from "./template.js";
import { writeFileSync } from "fs";

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

export type DaoParams = {
  struct: string
  daos: Array<Dao>
}

export function addDaos(path: string, params: DaoParams) {
  // read file
  let lines = readFileAsStringArr(path);

  // parse all templates
  const parsed = params.daos.map(dao => {
    const data = { name: dao.name };
    return {
      var: parseTemplate(template.DaoVar, data),
      attribute: parseTemplate(template.DaoAttribute, data),
      init: parseTemplate(template.DaoInit, data).split("\n").map(l => "\t"+l+"\n").join(""),
      inject: parseTemplate(template.DaoInject, data),
    };
  });

  const daosToAdd = parsed.filter(dao => {
    return !lines.some(line => line.includes(dao.var.slice(0, -1)));
  });

  if (daosToAdd.length == 0) {
    return
  }

  // put import
  if (!lines.some(line => line.includes("sauron/models/dao"))) {
    let importClose = lines.findIndex((line) => line.includes("import ("))+1;
    while (lines[importClose] != ')') importClose++;

    lines = [
      ...lines.slice(0, importClose),
      "\t"+template.DaoImport.trimEnd(),
      ...lines.slice(importClose)
    ];
  }

  // put vars
  let varClose = lines.findIndex((line) => line.includes("var ("))+1;
  while (lines[varClose] != ')') varClose++;

  lines = [
    ...lines.slice(0, varClose),
    ...daosToAdd.map(d => "\t"+d.var.trimEnd()),
    ...lines.slice(varClose)
  ];

  // put attributes in struct
  let structClose = lines.findIndex((line) => line.includes("struct {"))+1;
  while (!lines[structClose].includes('instrumentable.Instrumented') && lines[structClose] != '}') structClose++;
  
  lines = [
    ...lines.slice(0, structClose),
    ...daosToAdd.map(d => "\t"+d.attribute.trimEnd()),
    ...lines.slice(structClose)
  ];

  // put inits in constructor
  let constructorClose = lines.findIndex((line) => line.includes(`return &${params.struct}{`));
  lines = [
    ...lines.slice(0, constructorClose),
    ...daosToAdd.map(d => d.init.trimEnd()),
    ...lines.slice(constructorClose)
  ];

  // put injects
  let returnClose = lines.findIndex((line) => line.includes(`return &${params.struct}{`))+1;
  while (lines[returnClose] != '\t}') returnClose++;

  lines = [
    ...lines.slice(0, returnClose),
    ...daosToAdd.map(d => "\t\t"+d.inject.trimEnd()),
    ...lines.slice(returnClose)
  ];

  // write file
  const joined = lines.join("\n")
  writeFileSync(path, toString(joined), { encoding: 'utf-8' });
}
