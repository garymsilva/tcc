import path from "path";
import fs from 'fs'

/**
 * Capitaliza uma string
 * 
 * @param str - String a ser capitalizada
 * @returns A string capitalizada
 */
export function capitalizeString(str: string) : string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Aplica `path.join` nos argumentos passados, e cria o caminho gerado caso não exista
 * 
 * @param args - Caminho para ser construído
 * @returns O caminho construído e normalizado, o mesmo retorno que `path.join(args)`
 */

export const ident_size = 4;
export const base_ident = ' '.repeat(ident_size);

export function createPath(...args: string[]) : string {
  const PATH = path.join(...args)
  if(!fs.existsSync(PATH)) {
    fs.mkdirSync(PATH, { recursive: true })
  }
  return PATH
}

/**
 * Dado um template de string, substitui as variáveis pelos dados fornecidos e retorna a string resultante
 * 
 * @param template - String para usar como template
 * @param data - Dados para substituir no template
 * @returns - Template com as variáveis substituídas pelos dados
 */
export function parseTemplate(template: string, data: Object): string {
  let result = template;
  Object.entries(data).forEach(([k, v]) => {
    result = result.replaceAll(`{{${k}}}`, v);
    result = result.replaceAll(`{{upper_${k}}}`, capitalizeString(v));
  })
  return result;
}
