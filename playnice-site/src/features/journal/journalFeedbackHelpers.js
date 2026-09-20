export const getJournalSavedFeedback = (
  feedback = {},
  article,
  getArticleKey
) => {
  const key = getArticleKey(article);

  if (!key) return null;

  return feedback[key] || null;
};

export const updateJournalFeedbackVote = ({
  feedback = {},
  article,
  vote,
  now,
  getArticleKey,
}) => {
  const key = getArticleKey(article);

  if (!key) {
    return {
      key: "",
      current: {},
      nextFeedback: feedback,
    };
  }

  const current = feedback[key] || {};

  return {
    key,
    current,
    nextFeedback: {
      ...feedback,
      [key]: {
        ...current,
        vote,
        submittedAt:
          vote
            ? now
            : current.submittedAt || null,
      },
    },
  };
};

export const updateJournalFeedbackNote = ({
  feedback = {},
  article,
  value,
  getArticleKey,
}) => {
  const key = getArticleKey(article);

  if (!key) return feedback;

  const current = feedback[key] || {};

  return {
    ...feedback,
    [key]: {
      ...current,
      note: value,
    },
  };
};

export const clearSubmittedJournalNote = ({
  feedback = {},
  article,
  now,
  getArticleKey,
}) => {
  const key = getArticleKey(article);

  if (!key) return feedback;

  const current = feedback[key] || {};

  return {
    ...feedback,
    [key]: {
      ...current,
      note: "",
      submittedAt: now,
    },
  };
};

export const getJournalFeedbackSubmission = ({
  feedback = {},
  article,
  override = {},
  getArticleKey,
}) => {
  const key = getArticleKey(article);

  if (!key) return null;

  const saved = feedback[key] || {};

  const vote =
    override.vote ??
    saved.vote ??
    "";

  const note = String(
    override.note ??
      saved.note ??
      ""
  ).trim();

  if (!vote) return null;

  return {
    key,
    vote,
    note,
  };
};

export const buildJournalFeedbackPayload = ({
  article,
  articleKey,
  articleTitle,
  vote,
  note,
  lang,
  page,
  deviceId,
  timestamp,
}) => ({
  timestamp,
  feedbackId:
    `journal_${deviceId}_${articleKey}`,
  deviceId,
  article: articleKey,
  articleTitle,
  vote,
  note,
  lang,
  page,
  source: "journal",
});
