import type { Model } from '../language/generated/ast.js';
import * as path from 'node:path';
import {
    GenerateBaseProject,
} from './api-generator/index.js';
import { GenerateModels } from './api-generator/generators/model/index.js';
import { GenerateDaos } from './api-generator/generators/dao/index.js';

export function generateGoLangApi(model: Model, filePath: string, destination: string | undefined): string {
    const finalDestination = extractDestination(filePath, destination);
    GenerateBaseProject(model, finalDestination);
    GenerateModels(model, finalDestination); // TODO: talvez chamar um por um
    GenerateDaos(model, finalDestination); // TODO: idem
    return finalDestination;
}

function extractDestination(filePath: string, destination?: string) : string {
    const path_ext = new RegExp(path.extname(filePath)+'$', 'g')
    filePath = filePath.replace(path_ext, '')
  
    return destination ?? path.join(path.dirname(filePath), "src")
}
