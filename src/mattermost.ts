import {context} from '@actions/github'
import {JunitResults} from './xunit'
import * as core from '@actions/core'
import bent from 'bent'

export interface MattermostAttachmentField {
  short: boolean
  title: string
  value: string
}

export interface MattermostAttachment {
  fallback: string
  color: string
  pretext?: string
  text: string
  author_name: string
  author_icon?: URL
  author_link?: URL
  title: string
  title_link?: URL
  fields: MattermostAttachmentField[]
  image_url?: URL
}

export async function postReportToMatterMost(
  mattermostWebhookUrl: string,
  report: JunitResults
): Promise<string> {
  const mmBody = {
    username: 'Github Actions Runner',
    text: 'test',
    props: {attachments: [renderReportToMarkdown(report)]}
  }
  core.debug(`MM payload: ${JSON.stringify(mmBody)}`)
  const mmPost = bent('string', 'POST')
  return mmPost(mattermostWebhookUrl, mmBody)
}

export function renderReportToMarkdown(
  report: JunitResults
): MattermostAttachment {
  return {
    author_name: 'Xunit Mattermost reporter',
    color: '#00aa00',
    fallback: 'Fallback text',
    fields: [],
    text: `Xunit report for ${report.testsuites.length} test suites on ${context.workflow}`,
    title: 'Test Title'
  }
}
