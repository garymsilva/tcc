import { toString } from "langium"
import { Method } from "../../../../language/generated/ast.js"
import { parseTemplate, readFileAsStringArr } from "../../../util/generator-utils.js"
import { Func, FuncDeclare } from "./template.js"
import { appendFileSync, writeFileSync } from "fs"

export type MethodParams = {
  interface: string
  struct: string
  key: string
  methods: Method[]
}

export function addMethods(path: string, params: MethodParams) {
  const lines = readFileAsStringArr(path);
  const methods = params.methods.map(func => ({
    head: parseTemplate(FuncDeclare, { name: func.name }),
    body: parseTemplate(Func, { name: func.name, key: params.key, struct_name: params.struct })
  }));


  const methodsToAdd = methods.filter(method => {
    return !lines.some(line => line.includes(method.head.slice(0, -1)));
  })
  
  const heads = methodsToAdd.map(m => "\t"+m.head).join("");

  const openingIndex = lines.findIndex((line) => line.includes(params.interface));
  let closingIndex = openingIndex+1;
  while (lines[closingIndex] != '}') {
    closingIndex++;
  }

  const withHeads = `${lines.slice(0, closingIndex).join("\n")}\n${heads}${lines.slice(closingIndex).join("\n")}\n`;
  writeFileSync(path, toString(withHeads), { encoding: 'utf-8' });

  const bodies = methodsToAdd.map(m => m.body+"\n").join("");
  appendFileSync(path, toString(bodies), { encoding: 'utf-8'});
}
