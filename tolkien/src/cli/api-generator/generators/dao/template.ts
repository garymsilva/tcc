import { expandToStringWithNL } from "langium";

export const template = expandToStringWithNL`
package dao

type {{upper_name}}Dao interface {
}

type {{name}}Dao struct {
}

func New() {{upper_name}}Dao {
  return &{{name}}Dao {
  }
}
`
