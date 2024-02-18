import { createADEActionsRegistry } from "./_properties/generators"
import { BingWebSearchAction } from "./bing-webSearch"
import { DalleCreateImageAction } from "./dalle-createImage"
import { HelloWorldAction } from "./energize-helloWorld"
import { GoogleGetContactAction } from "./google-getContact"
import { GoogleMoveEmailToTrash } from "./google-moveEmailToTrash"
import { GoogleReadEmailAction } from "./google-readEmail"
import { GoogleReplyToEmailAction } from "./google-replyToEmail"
import { GoogleSearchEmailInboxAction } from "./google-searchEmailInbox"
import { GoogleSendMailAction } from "./google-sendMail"
import { GoogleWebSearchAction } from "./google-webSearch"
import { LinearCreateIssueAction } from "./linear-createIssue"
import { PlanetScaleGetBranchSchemaAction } from "./planetScale-getBranchSchema"
// <|GENERATOR|> import new action here

const ActionsRegistry = createADEActionsRegistry([
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
