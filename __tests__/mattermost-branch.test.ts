import {collectXUnitData} from '../src/xunit'
import {renderReportToMattermostAttachment} from '../src/mattermost'

jest.mock('@actions/github', () => ({
  context: {
    actor: 'test-actor',
    ref: 'refs/heads/master',
    workflow: 'test-workflow',
    repo: {
      owner: 'test-owner',
      repo: 'test-repo'
    },
    payload: {
      sender: {
        html_url: 'https://example.com/sender',
        avatar_url: 'https://example.com/sender.png'
      },
      repository: {html_url: 'https://example.com/test-owner/test-repo'},
      pull_request: null
    }
  }
}))
describe('Test mattermost renderings', () => {
  describe('Branch', () => {
    test('Single report renders attachment properly', async () => {
      const path = __dirname + '/fixtures/xunit-fixture.xml'
      const junitResults = await collectXUnitData(path)
      const message = renderReportToMattermostAttachment(junitResults)
      expect(message.color).toEqual('#00aa00')
      expect(message.title).toEqual('Test run success')
      expect(message.text).toEqual(
        '![test-actor avatar](https://example.com/sender.png&size=18) [test-actor](https://example.com/sender) ran some tests ran on [refs/heads/master](https://example.com/test-owner/test-repo/tree/master) at [test-owner/test-repo](https://example.com/test-owner/test-repo) as part of the [test-workflow](https://example.com/test-owner/test-repo/actions?query=workflow%3Atest-workflow) workflow.\n\n| Test suite | Results |\n|:---|:---|\n| org.owntracks.android.data.repos.MemoryContactsRepoTest (26.802s) | :tada: 5 tests, 5 passed, 0 skipped |\n| **Total (26.802s)** | **5 tests, 5 passed, 0 failed, 0 skipped** |'
      )
    })

    test('Multi report with failures renders attachment properly', async () => {
      const path = __dirname + '/fixtures/multiple/'
      const junitResults = await collectXUnitData(path)
      const message = renderReportToMattermostAttachment(junitResults)
      expect(message.color).toEqual('#aa0000')
      expect(message.title).toEqual('Test run failure')
      expect(message.text).toEqual(
        '![test-actor avatar](https://example.com/sender.png&size=18) [test-actor](https://example.com/sender) ran some tests ran on [refs/heads/master](https://example.com/test-owner/test-repo/tree/master) at [test-owner/test-repo](https://example.com/test-owner/test-repo) as part of the [test-workflow](https://example.com/test-owner/test-repo/actions?query=workflow%3Atest-workflow) workflow.\n\n| Test suite | Results |\n|:---|:---|\n| org.owntracks.android.data.repos.MemoryContactsRepoTest (26.802s) | :tada: 5 tests, 5 passed, 0 skipped |\n| org.owntracks.android.support.ParserTest (24.701s) | :tada: 11 tests, 11 passed, 0 skipped |\n| org.owntracks.android.services.MessageProcessorEndpointHttpTest (2.117s) | :rotating_light: 7 tests, 1 failed |\n| **Total (53.62s)** | **23 tests, 22 passed, 1 failed, 0 skipped** |'
      )
    })
  })
})