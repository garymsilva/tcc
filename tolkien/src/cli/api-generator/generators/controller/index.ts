import { Controller, Model } from "../../../../language/generated/ast.js";
import { parseTemplate } from '../../../util/generator-utils.js';
import config from '../../../config.js';
import { File, generateFile } from '../types.js';
import * as template from './template.js';

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
  ]

  files.forEach(file => generateFile(file, config.targetFolder))
}

export function GenerateControllers(controllers: Array<Controller>) {
  controllers.forEach(controller => GenerateController(controller))
}
