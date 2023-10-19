import { expandToStringWithNL } from "langium";

export const BaseDao = expandToStringWithNL`
package dao

import (
	"context"
	"fmt"

	"sauron/repository/hasura"

	"github.com/joaopandolfi/blackwhale/remotes/jaeger"
	"github.com/opentracing/opentracing-go"
)

var (
	HasuraClient hasura.HasuraClient
)

type dao struct {
	client hasura.HasuraClient
	name   string
}

// SpanTrace - raise a span to monitor the context
func (d *dao) SpanTrace(ctx context.Context, name string, tags map[string]interface{}) (context.Context, opentracing.Span) {
	return jaeger.SpanTrace(ctx, fmt.Sprintf("%s.%s", d.name, name), tags)
}

func new(name string) dao {
	InitHasuraClient()
	return dao{
		client: HasuraClient,
		name:   name,
	}
}

func InitHasuraClient() {
	if HasuraClient == nil {
		HasuraClient = hasura.NewHasuraClient()
	}
}
`

export const Dao = expandToStringWithNL`
package dao

type {{upper_name}}Dao interface {
  // {{methods}}
}

type {{name}}Dao struct {
  dao
}

func New() {{upper_name}}Dao {
  return &{{name}}Dao {
    dao: new("{{name}}Dao"),
  }
}
`
