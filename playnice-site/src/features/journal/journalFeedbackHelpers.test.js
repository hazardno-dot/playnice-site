import {
  getJournalSavedFeedback,
  updateJournalFeedbackVote,
  updateJournalFeedbackNote,
  clearSubmittedJournalNote,
  getJournalFeedbackSubmission,
  buildJournalFeedbackPayload,
} from "./journalFeedbackHelpers";

const getArticleKey = (article) =>
  article?.id || "";

describe("journalFeedbackHelpers", () => {
  test("reads saved feedback by article key", () => {
    const feedback = {
      7: {
        vote: "up",
        note: "Great",
      },
    };

    expect(
      getJournalSavedFeedback(
        feedback,
        { id: 7 },
        getArticleKey
      )
    ).toEqual({
      vote: "up",
      note: "Great",
    });
  });

  test("updates vote and submittedAt while preserving current note", () => {
    const result =
      updateJournalFeedbackVote({
        feedback: {
          7: {
            note: "Existing note",
          },
        },
        article: { id: 7 },
        vote: "up",
        now: 1234,
        getArticleKey,
      });

    expect(result.current).toEqual({
      note: "Existing note",
    });

    expect(
      result.nextFeedback[7]
    ).toEqual({
      note: "Existing note",
      vote: "up",
      submittedAt: 1234,
    });
  });

  test("clearing vote keeps previous submittedAt", () => {
    const result =
      updateJournalFeedbackVote({
        feedback: {
          7: {
            vote: "up",
            submittedAt: 99,
          },
        },
        article: { id: 7 },
        vote: "",
        now: 1234,
        getArticleKey,
      });

    expect(
      result.nextFeedback[7]
        .submittedAt
    ).toBe(99);
  });

  test("updates note without changing other fields", () => {
    const result =
      updateJournalFeedbackNote({
        feedback: {
          7: {
            vote: "down",
          },
        },
        article: { id: 7 },
        value: "Needs more detail",
        getArticleKey,
      });

    expect(result[7]).toEqual({
      vote: "down",
      note: "Needs more detail",
    });
  });

  test("clears submitted note and stamps submission time", () => {
    const result =
      clearSubmittedJournalNote({
        feedback: {
          7: {
            vote: "up",
            note: "Thanks",
          },
        },
        article: { id: 7 },
        now: 555,
        getArticleKey,
      });

    expect(result[7]).toEqual({
      vote: "up",
      note: "",
      submittedAt: 555,
    });
  });

  test("builds submission from override and trims note", () => {
    expect(
      getJournalFeedbackSubmission({
        feedback: {
          7: {
            vote: "up",
            note: " saved ",
          },
        },
        article: { id: 7 },
        override: {
          note: " override ",
        },
        getArticleKey,
      })
    ).toEqual({
      key: 7,
      vote: "up",
      note: "override",
    });
  });

  test("returns null when no vote is available", () => {
    expect(
      getJournalFeedbackSubmission({
        feedback: {},
        article: { id: 7 },
        getArticleKey,
      })
    ).toBeNull();
  });

  test("builds current feedback payload contract", () => {
    expect(
      buildJournalFeedbackPayload({
        article: { id: 7 },
        articleKey: 7,
        articleTitle: "Title",
        vote: "up",
        note: "Nice",
        lang: "sr",
        page: "/journal/test",
        deviceId: "device-1",
        timestamp:
          "2026-09-20T10:00:00.000Z",
      })
    ).toEqual({
      timestamp:
        "2026-09-20T10:00:00.000Z",
      feedbackId:
        "journal_device-1_7",
      deviceId: "device-1",
      article: 7,
      articleTitle: "Title",
      vote: "up",
      note: "Nice",
      lang: "sr",
      page: "/journal/test",
      source: "journal",
    });
  });
});
