import { expandToStringWithNL } from "langium"

export const Controller = expandToStringWithNL`
package {{name}}

import (
  "sauron/web/controllers"
  "sauron/web/server"
)

type controller struct {
  s *server.Server
  // TODO: linkar services
  // {{services}}
}

func New() controllers.Controller {
  return &controller {
    s: nil,
    // Inicializar services
    // {{services}}
  }
}

// {{methods}}
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
