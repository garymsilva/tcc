import { Model } from "../../../../language/generated/ast.js"
import { parseTemplate } from "../../../util/generator-utils.js"
import {
  Config,
  ControllerInterface,
  GoMod,
  Main,
  Router,
  StartCmd,
  WebServer,
} from "./template.js"

export function buildGoMod(model: Model): string {
	let deps = "";
  for(const lib of model.dependencies) {
    deps += `\t${lib.name}\n`
  }

  const data = {
		module: model.module?.name,
		go_version: model.goVersion?.name ?? "",
		direct_dependencies: deps.slice(0, -1),
		indirect_dependencies: ""
	}
	return parseTemplate(GoMod, data)
}

export function buildStartCmd(model: Model): string {
	const data = {}
	return parseTemplate(StartCmd, data)
}

export function buildMain(model: Model): string {
	const data = {}
	return parseTemplate(Main, data)
}

export function buildConfig(model: Model): string {
	const data = {}
	return parseTemplate(Config, data)
}

export function buildControllerInterface(model: Model): string {
	const data = {}
	return parseTemplate(ControllerInterface, data)
}

export function buildRouter(model: Model): string {
	const data = {}
	return parseTemplate(Router, data)
}

export function buildWebServer(model: Model): string {
	const data = {}
	return parseTemplate(WebServer, data)
}
