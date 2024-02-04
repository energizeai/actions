import { ActionBuilderWithFunction } from "@energizeai/types"
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

const ActionsRegistry = {
  HelloWorldAction: HelloWorldAction,
  GoogleSendMailAction: GoogleSendMailAction,
  GoogleReplyToEmailAction: GoogleReplyToEmailAction,
  GoogleSearchEmailInboxAction: GoogleSearchEmailInboxAction,
  GoogleReadEmailAction: GoogleReadEmailAction,
  GoogleMoveEmailToTrashAction: GoogleMoveEmailToTrash,
  GoogleGetContactAction: GoogleGetContactAction,
  GoogleWebSearchAction: GoogleWebSearchAction,
  DalleCreateImageAction: DalleCreateImageAction,
  LinearCreateIssueAction: LinearCreateIssueAction,
  BingWebSearchAction: BingWebSearchAction,
  PlanetScaleGetBranchSchemaAction: PlanetScaleGetBranchSchemaAction,
  // <|GENERATOR|> add new action here
} as const satisfies Record<
  string,
  ActionBuilderWithFunction<any, any, any, any>
>

export { ActionsRegistry }
