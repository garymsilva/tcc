import { expandToStringWithNL } from "langium"

export const Service = expandToStringWithNL`
package {{name}}

import (
	"github.com/joaopandolfi/blackwhale/remotes/instrumentable"
)

var (
)

type {{upper_name}}Service interface {
}

type service struct {
	instrumentable.Instrumented
}

func New{{upper_name}}Service() {{upper_name}}Service {
	return &service{
	}
}
`

export const ServiceImport = expandToStringWithNL`
"sauron/services/{{name}}"
`

export const ServiceVar = expandToStringWithNL`
{{upper_name}}Service {{name}}.{{upper_name}}Service
`

export const ServiceAttribute = expandToStringWithNL`
{{name}}Service {{name}}.{{upper_name}}Service
`

export const ServiceInit = expandToStringWithNL`
if {{upper_name}}Service == nil {
	{{upper_name}}Service = {{name}}.New{{upper_name}}Service()
}
`

export const ServiceInject = expandToStringWithNL`
{{name}}Service: {{upper_name}}Service,
`
