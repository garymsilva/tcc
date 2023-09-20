package participant

type participantController interface {}

type controller struct {}

func New() participantController {
  return &controller{}
}
