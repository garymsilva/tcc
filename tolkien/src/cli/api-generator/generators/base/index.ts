import fs from 'fs'
import path from 'path'
import { toString } from 'langium';
import {
  Config,
  ControllerInterface,
  Main,
  Router,
  StartCmd,
  WebServer
} from "./template.js"

type File = {
  relativePath: string
  fileName: string
  template: string
}

const baseProject: File[] = [
  {
    relativePath: "/",
    fileName: "main.go",
    template: Main
  },
  {
    relativePath: "/web/server",
    fileName: "server.go",
    template: WebServer
  },
  {
    relativePath: "/web/router",
    fileName: "router.go",
    template: Router
  },
  {
    relativePath: "/web/controllers",
    fileName: "controller.go",
    template: ControllerInterface
  },
  {
    relativePath: "/config",
    fileName: "config.go",
    template: Config
  },
  {
    relativePath: "/cmd",
    fileName: "start.go",
    template: StartCmd
  },
]

export function GenerateBaseProject(target_folder: string) {
  for (let i = 0; i < baseProject.length; i++) {
    const file = baseProject[i];
    fs.mkdirSync(path.join(target_folder, file.relativePath), {recursive:true})
    fs.writeFileSync(path.join(target_folder, file.relativePath, file.fileName), toString(file.template))
  }
}
