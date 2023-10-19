import { expandToStringWithNL } from "langium";

export const FuncDeclare = expandToStringWithNL`
\t{{upper_name}}()
`

export const Func = expandToStringWithNL`
func ({{key}} *{{entity_name}}) {{upper_name}}() {}
`
