// import fs from "fs";
import { Model } from "../../language/generated/ast.js";
import { GenerateBaseProject } from "./generators/base/index.js";
// import { generateControllers } from "./generators/controller/index.js";

export function generateControllersModule(model: Model, target_folder: string) : void {
  // const target_folder_controllers = target_folder+"/web/controllers"
  // generateControllers(model, target_folder_controllers)
  
  // fs.mkdirSync(target_folder_controllers, {recursive:true})
}

export {
  GenerateBaseProject
}
