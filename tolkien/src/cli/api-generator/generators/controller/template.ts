export const Controller = `
package {package_name}

import (
  "sauron/web/controllers"
  "sauron/web/server"
)

type controller struct {
  s *server.Server
}

func New() controllers.Controller {
  return &controller {
    s: nil,
    {services}
  }
}

{methods}
`

export const ControllerTest = `
package {package_name}_test
`
