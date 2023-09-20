import fs from 'fs';
import path from 'path';
import { Controller, Model, isController } from "../../language/generated/ast.js";
import { expandToStringWithNL, toString } from 'langium';
import { createPath } from '../util/generator-utils.js';


function generateControllerFile(controller: Controller): string {
  return expandToStringWithNL`
    package ${controller.name}

    type ${controller.name}Controller interface {}

    type controller struct {}
    
    func New() ${controller.name}Controller {
      return &controller{}
    }
  `
}

export function generateControllers(model: Model, target_folder: string) : void {
  const controllers = model.controllers.filter(isController);

  for (const controller of controllers) {
    const name = controller.name;
    const final_path = createPath(target_folder, name)
    fs.writeFileSync(path.join(final_path, `${name}.go`), toString(generateControllerFile(controller)))
  }
}
