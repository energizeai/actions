import DalleCreateImageAction from "./dalle-create-image"
import GoogleSendMailAction from "./google-send-mail"
// <|GENERATOR|> import new action here

const ActionsRegistry = {
  GoogleSendMail: GoogleSendMailAction,
  DalleCreateImage: DalleCreateImageAction,
  // <|GENERATOR|> add new action here
} as const

export { ActionsRegistry }
