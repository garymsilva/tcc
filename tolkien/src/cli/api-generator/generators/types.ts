import path from "path"
import { Model } from "../../../language/generated/ast.js"
import { existsSync, writeFileSync } from "fs"
import { toString } from "langium"
import { createPath } from "../../util/generator-utils.js"

export type File = {
  relativePath: string
  fileName: string
  builder: (model?: Model, data?: () => Object) => string
  data?: () => Object
}

export function generateFile(file: File, target_folder: string, model?: Model): string {
  const dirPath = path.join(target_folder, file.relativePath);
  createPath(dirPath);

  const filePath = path.join(dirPath, file.fileName);
  const fileExists = existsSync(filePath);
  if (!fileExists) {
    writeFileSync(filePath, toString(file.builder(model, file.data)));
  }

  return filePath;
}
