import { Model } from '../../../../language/generated/ast.js';
import { File, generateFile } from '../types.js';
import config from '../../../config.js';
import {
  buildConfig,
  buildControllerInterface,
  buildGoMod,
  buildMain,
  buildRouter,
  buildStartCmd,
  buildWebServer,
} from './builders.js';

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

export function GenerateBaseProject(model: Model) {
  for (let i = 0; i < baseProject.length; i++) {
    generateFile(baseProject[i], config.targetFolder, model);
  }
}
