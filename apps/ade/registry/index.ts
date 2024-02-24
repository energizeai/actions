import { BingWebSearchAction } from "./_actions/bing-webSearch"
import { DalleCreateImageAction } from "./_actions/dalle-createImage"
import { HelloWorldAction } from "./_actions/energize-helloWorld"
import { GoogleGetContactAction } from "./_actions/google-getContact"
import { GoogleMoveEmailToTrash } from "./_actions/google-moveEmailToTrash"
import { GoogleReadEmailAction } from "./_actions/google-readEmail"
import { GoogleReplyToEmailAction } from "./_actions/google-replyToEmail"
import { GoogleSearchEmailInboxAction } from "./_actions/google-searchEmailInbox"
import { GoogleSendMailAction } from "./_actions/google-sendMail"
import { GoogleWebSearchAction } from "./_actions/google-webSearch"
import { LinearCreateIssueAction } from "./_actions/linear-createIssue"
import { PlanetScaleGetBranchSchemaAction } from "./_actions/planetScale-getBranchSchema"
import { createADEActionsRegistry } from "./_properties/generators"
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
