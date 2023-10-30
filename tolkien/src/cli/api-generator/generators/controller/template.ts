import { expandToStringWithNL } from "langium"

export const Controller = expandToStringWithNL`
package {{name}}

import (
	"sauron/web/controllers"
	"sauron/web/server"
)

var (
)

type controller struct {
	s *server.Server
}

func New() controllers.Controller {
	return &controller{
		s: nil,
	}
}
`

export const Entities = expandToStringWithNL`
package {{name}}
`

export const Routes = expandToStringWithNL`
package {{name}}

import (
	md "sauron/web/middleware"
	"sauron/web/server"
)

func (c *controller) SetupRouter(s *server.Server) {
	c.s = s

	c.s.R.Methods("OPTIONS").HandlerFunc(md.Options)
}

`

export const ControllerTest = expandToStringWithNL`
package {{name}}_test
`

export const HandlerHead = expandToStringWithNL`
{{name}}(w http.ResponseWriter, r *http.Request)
`

export const Handler = expandToStringWithNL`
func ({{key}} *{{struct_name}}) {{name}}(w http.ResponseWriter, r *http.Request) {
}
`
