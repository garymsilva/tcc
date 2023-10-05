import { Model } from "../../../../language/generated/ast.js"
import { parseTemplate } from "../../../util/generator-utils.js"
import * as template from "./template.js"

const emptyPayload = {}

export function buildGoMod(model?: Model): string {
	if (!model) {
		return ""
	}

	let deps = "";
  for(const lib of model.dependencies) {
    deps += `\t${lib.name}\n`
  }

  const payload = {
		module: model.module?.name,
		go_version: model.goVersion?.name ?? "",
		direct_dependencies: deps.slice(0, -1),
		indirect_dependencies: ""
	}

	return parseTemplate(template.GoMod, payload)
}

export function buildStartCmd(): string {
	return parseTemplate(template.StartCmd, emptyPayload)
}

export function buildMain(): string {
	return parseTemplate(template.Main, emptyPayload)
}

export function buildConfig(): string {
	return parseTemplate(template.Config, emptyPayload)
}

export function buildControllerInterface(): string {
	return parseTemplate(template.ControllerInterface, emptyPayload)
}

export function buildRouter(): string {
	return parseTemplate(template.Router, emptyPayload)
}

export function buildWebServer(): string {
	return parseTemplate(template.WebServer, emptyPayload)
}
