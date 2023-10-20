export const template = `
package {{name}}

import (
  
  // "sauron/models/dao"
  // "sauron/services/participant

	"github.com/joaopandolfi/blackwhale/remotes/instrumentable"
)

var (
	// daos
  // AdjustmentRequestDao dao.AdjustmentRequestDao
  // services
  // ParticipantService participant.ParticipantService
)

type {{upper_name}}Service interface {
}

type service struct {
	// TODO: declarar correlações
  // adjustmentRequestDao dao.AdjustmentRequestDao
  // participantService participant.ParticipantService
  instrumentable.Instrumented
}

func New{{upper_name}}Service() {{upper_name}}Service {
	// TODO: instanciar correlações
  // pra cada um, se for nil, setar, chamando o New
  // if AdjustmentRequestDao == nil {
	// 	AdjustmentRequestDao = dao.NewAdjustmentRequestDao()
	// }
  // if ParticipantService == nil {
	// 	ParticipantService = participant.New()
	// }

	return &service{
    // TODO: setar correlações
		// adjustmentRequestDao: AdjustmentRequestDao,
	}
}
`
