# Journal feedback rollout

Deploy the Apps Script change before merging the frontend PR.

1. In the existing Apps Script project, replace `handleJournalFeedback` with `journal-feedback.gs`. Keep all other handlers.
2. In `doPost`, accept `source === "journal_feedback"` explicitly, and restrict legacy detection to `(source === "journal" || !source) && isLegacyJournalFeedbackPayload(data)`.
3. Update the existing web-app deployment to a new version, retaining its URL and existing access settings. Saving the editor alone does not update the deployment.
4. Verify a test vote, a note, then a changed vote with the PR preview: one row, changed vote, original note retained. Check offline/error behavior and retry. Do not merge before the deployed acknowledgement works through browser CORS.
5. Merge the frontend PR after the live integration check.

The frontend requires status=ok plus matching feedbackId and operation in the response. The old backend cannot satisfy this contract. The new handler accepts cached legacy clients and preserves comments on legacy empty-note votes; legacy clients can still send their draft notes until refreshed.

One current comment is stored per browser/article. A new explicit note replaces the previous note. Existing duplicate rows are not deleted or repaired by this change.

Local handler verification: `node scripts/apps-script/journal-feedback.test.cjs`. Tests use an in-memory sheet; they do not submit production feedback.
