import { submitJournalFeedback } from './journalFeedbackTransport';
const payload = { feedbackId: 'journal_device_21', operation: 'vote' };
test('requires matching server acknowledgement', async () => {
  const send = jest.fn().mockResolvedValue({ok: true, json: async () => ({status:'ok', ...payload})});
  await expect(submitJournalFeedback(payload, send)).resolves.toMatchObject(payload);
  expect(JSON.parse(send.mock.calls[0][1].body)).toEqual(payload);
});
test.each([
  {ok:true, result:{status:'ok'}},
  {ok:true, result:{status:'busy'}},
  {ok:false, result:{status:'ok', ...payload}},
  {ok:true, result:{status:'ok', ...payload, operation:'note'}},
])('rejects unconfirmed responses: %j', async ({ok, result}) => {
  await expect(submitJournalFeedback(payload, async () => ({ok,json:async()=>result}))).rejects.toThrow();
});
test('network failure remains a failure', async () => {
  await expect(submitJournalFeedback(payload, async () => {throw new Error('offline');})).rejects.toThrow('offline');
});
