import { createActionsRegistry } from "ai-actions"
import { BingWebSearchAction } from "./bing-web-search"
import { DalleCreateImageAction } from "./dalle-create-image"
import { GoogleGetContactAction } from "./google-get-contact"
import { GoogleMoveEmailToTrash } from "./google-move-email-to-trash"
import { GoogleReadEmailAction } from "./google-read-email"
import { GoogleReplyToEmailAction } from "./google-reply-to-email"
import { GoogleSearchEmailInboxAction } from "./google-search-email-inbox"
import { GoogleSendMailAction } from "./google-send-mail"
import { GoogleWebSearchAction } from "./google-web-search"
import { HelloWorldAction } from "./hello-world-action"
import { LinearCreateIssueAction } from "./linear-create-issue"
import { PlanetScaleGetBranchSchemaAction } from "./planet-scale-get-branch-schema"
// <|GENERATOR|> import new action here

const ActionsRegistry = createActionsRegistry([
  HelloWorldAction,
  GoogleSendMailAction,
  GoogleReplyToEmailAction,
  GoogleSearchEmailInboxAction,
  GoogleReadEmailAction,
  GoogleMoveEmailToTrash,
  GoogleGetContactAction,
  GoogleWebSearchAction,
  DalleCreateImageAction,
  LinearCreateIssueAction,
  BingWebSearchAction,
  PlanetScaleGetBranchSchemaAction,
  // <|GENERATOR|> add new action here
])

export { ActionsRegistry }
