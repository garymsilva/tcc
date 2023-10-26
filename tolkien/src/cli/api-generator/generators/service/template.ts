export const template = `
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
