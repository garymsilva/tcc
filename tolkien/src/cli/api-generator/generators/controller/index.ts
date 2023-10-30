import { Controller, Handler, Model } from "../../../../language/generated/ast.js";
import { parseTemplate, readFileAsStringArr } from '../../../util/generator-utils.js';
import generatorConfig from '../../../config.js';
import { File, generateFile } from '../types.js';
import * as template from './template.js';
import { addServices } from "../service/index.js";
import { appendFileSync } from "fs";
import { toString } from "langium";

function buildController(model?: Model, data: () => Object = () => ({})): string {
	return parseTemplate(template.Controller, data())
}

function buildControllerEntities(model?: Model, data: () => Object = () => ({})): string {
	return parseTemplate(template.Entities, data())
}

function buildControllerRoutes(model?: Model, data: () => Object = () => ({})): string {
	return parseTemplate(template.Routes, data())
}

function GenerateController(controller: Controller) {
  const relativePath = `/web/controllers/${controller.name}`
  const files: Array<File> = [
    {
      relativePath,
      fileName: `${controller.name.toLowerCase()}.go`,
      builder: buildController,
      data() {
        return {
          name: controller.name.toLowerCase(),
        }
      }
    },
    {
      relativePath,
      fileName: "entities.go",
      builder: buildControllerEntities,
      data() {
        return {
          name: controller.name.toLowerCase(),
        }
      }
    },
    {
      relativePath,
      fileName: "routes.go",
      builder: buildControllerRoutes,
      data() {
        return {
          name: controller.name.toLowerCase(),
        }
      }
    }
  ];

  const [path] = files.map(file => generateFile(file, generatorConfig.targetFolder));

  addServices(path, {
    struct: 'controller',
    services: controller.services,
  });
  addHandlers(path, {
    struct: 'controller',
    key: 'c',
    methods: controller.handlers,
  });
}

export function GenerateControllers(controllers: Array<Controller>) {
  controllers.forEach(controller => GenerateController(controller))
}

export type HandlerParams = {
  struct: string
  key: string
  methods: Handler[]
}

export function addHandlers(path: string, params: HandlerParams) {
  const lines = readFileAsStringArr(path);
  const methods = params.methods.map(func => ({
    head: parseTemplate(template.HandlerHead, { name: func.name}),
    body: parseTemplate(template.Handler, { name: func.name, key: params.key, struct_name: params.struct })
  }));


  const methodsToAdd = methods.filter(method => {
    return !lines.some(line => line.includes(method.head.slice(0, -1)));
  })

  if (methodsToAdd.length == 0) {
    return
  }
  
  const bodies = methodsToAdd.map(m => "\n"+m.body).join("");
  appendFileSync(path, toString(bodies), { encoding: 'utf-8'});
}
