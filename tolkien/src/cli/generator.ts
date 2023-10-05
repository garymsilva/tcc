import type { Model } from '../language/generated/ast.js';
import * as path from 'node:path';
import config from './config.js';
import {
    GenerateBaseProject,
    GenerateDomain,
    GenerateDaos,
    GenerateControllers,
    GenerateServices
} from './api-generator/index.js';

export function generateGoLangApi(model: Model, filePath: string, destination: string | undefined): string {
    const target = extractDestination(filePath, destination);
    config.targetFolder = target

    GenerateBaseProject(model);
    GenerateDomain(model.domain);
    GenerateDaos(model.daos);
    GenerateServices(model.services);
    GenerateControllers(model.controllers);
    return target;
}

function extractDestination(filePath: string, destination?: string) : string {
    const path_ext = new RegExp(path.extname(filePath)+'$', 'g')
    filePath = filePath.replace(path_ext, '')
  
    return destination ?? path.join(path.dirname(filePath), "src")
}
