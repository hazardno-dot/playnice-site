import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import JournalArticlePage from './JournalArticlePage';
let host, root;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(() => {act(() => root.unmount()); host.remove();});
const render = props => act(() => root.render(<JournalArticlePage article={{id:21,title:'Story',content:'Text'}} lang="en" {...props} />));
test('vote controls expose selection and do not submit a note', () => {
  const vote=jest.fn(), submit=jest.fn();
  render({feedback:{vote:'up',note:'draft'},onFeedbackVote:vote,onFeedbackSubmit:submit});
  const buttons=host.querySelectorAll('.journal-article-feedback-vote');
  expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
  act(() => buttons[1].click());
  expect(vote).toHaveBeenCalledWith('down'); expect(submit).not.toHaveBeenCalled();
});
test('pending request keeps safeguards without a visible sending message', () => {
  render({feedback:{vote:'up',note:'draft'},feedbackStatus:{pending:true}});
  expect([...host.querySelectorAll('.journal-article-feedback button, .journal-article-feedback textarea')].every(el=>el.disabled)).toBe(true);
  expect(host.querySelector('[role="status"]').textContent).toBe('');
});
test('failure retains draft and allows explicit retry; whitespace cannot submit', () => {
  const submit=jest.fn();
  render({feedback:{vote:'up',note:'Keep this'},feedbackStatus:{error:true},onFeedbackSubmit:submit});
  expect(host.querySelector('textarea').value).toBe('Keep this');
  expect(host.querySelector('[role="status"]').textContent).toContain('try again');
  act(() => host.querySelector('.journal-article-feedback-note button').click());
  expect(submit).toHaveBeenCalledTimes(1);
  render({feedback:{vote:'up',note:'  '}});
  expect(host.querySelector('.journal-article-feedback-note button').disabled).toBe(true);
});
