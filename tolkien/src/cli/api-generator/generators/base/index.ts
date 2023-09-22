import fs from 'fs'
import path from 'path'
import { toString } from 'langium';
import { Model } from '../../../../language/generated/ast.js';
import {
  buildConfig,
  buildControllerInterface,
  buildGoMod,
  buildMain,
  buildRouter,
  buildStartCmd,
  buildWebServer,
} from './builders.js';

type File = {
  relativePath: string
  fileName: string
  builder: (model: Model) => string
}

const baseProject: File[] = [
  {
    relativePath: "/",
    fileName: "go.mod",
    builder: buildGoMod
  },
  {
    relativePath: "/",
    fileName: "main.go",
    builder: buildMain
  },
  {
    relativePath: "/web/server",
    fileName: "server.go",
    builder: buildWebServer
  },
  {
    relativePath: "/web/router",
    fileName: "router.go",
    builder: buildRouter
  },
  {
    relativePath: "/web/controllers",
    fileName: "controller.go",
    builder: buildControllerInterface
  },
  {
    relativePath: "/config",
    fileName: "config.go",
    builder: buildConfig
  },
  {
    relativePath: "/cmd",
    fileName: "start.go",
    builder: buildStartCmd
  },
]

function generateFile(file: File, model: Model, target_folder: string) {
  fs.mkdirSync(path.join(target_folder, file.relativePath), {recursive:true})
  fs.writeFileSync(path.join(target_folder, file.relativePath, file.fileName), toString(file.builder(model)))
}

export function GenerateBaseProject(model: Model, target_folder: string) {
  for (let i = 0; i < baseProject.length; i++) {
    generateFile(baseProject[i], model, target_folder);
  }
}
