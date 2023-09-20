import type { Model } from '../language/generated/ast.js';
import * as path from 'node:path';
import { generateControllersModule } from './tolkienerator/main-generator.js';

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
    const finalDestination = extractDestination(filePath, destination);
    console.log("hello")
    generateControllersModule(model, finalDestination);
    return finalDestination;
}

function extractDestination(filePath: string, destination?: string) : string {
    const path_ext = new RegExp(path.extname(filePath)+'$', 'g')
    filePath = filePath.replace(path_ext, '')
  
    return destination ?? path.join(path.dirname(filePath), "generated")
}
