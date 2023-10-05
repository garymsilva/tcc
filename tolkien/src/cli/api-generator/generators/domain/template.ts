import { expandToStringWithNL } from "langium";

export const template = expandToStringWithNL`
package models

type {{upper_name}} struct{}
`
