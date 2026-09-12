import { useEffect, useRef } from "react";
import { supabase } from "./supabase";

const NOTE_WORKFLOW_UPDATED_EVENT = "playnice:note-workflow-updated";

function selectedNoteKey() {
  return document.querySelector(".main-stage .notes-detail-hero code")?.textContent?.trim() || "";
}

export default function NoteWorkflowAdvanceBridge() {
  const pendingApproveKey = useRef("");
  const pollTimer = useRef(null);

  useEffect(() => {
    const clearPoll = () => {
      if (pollTimer.current) window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    };

    const revealApply = (noteKey) => {
      if (!noteKey || pendingApproveKey.current !== noteKey) return;
      pendingApproveKey.current = "";
      clearPoll();
      window.dispatchEvent(new CustomEvent(NOTE_WORKFLOW_UPDATED_EVENT, { detail: { noteKey, approved: true } }));
    };

    const confirmApproved = async (noteKey) => {
      const { data } = await supabase
        .from("note_drafts")
        .select("note_key,review_status")
        .eq("note_key", noteKey)
        .maybeSingle();
      if (data?.review_status === "approved") revealApply(noteKey);
    };

    const handleClick = (event) => {
      const button = event.target.closest("button");
      if (!button || button.textContent?.trim() !== "Approve" || !button.closest(".notes-workflow")) return;
      const noteKey = selectedNoteKey();
      if (!noteKey) return;
      pendingApproveKey.current = noteKey;
      clearPoll();
      let attempts = 0;
      pollTimer.current = window.setInterval(() => {
        attempts += 1;
        confirmApproved(noteKey);
        if (attempts >= 24) {
          clearPoll();
          pendingApproveKey.current = "";
        }
      }, 150);
    };

    document.addEventListener("click", handleClick, true);
    const channel = supabase
      .channel("note-workflow-advance")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "note_drafts" }, (payload) => {
        const row = payload.new || {};
        if (row.note_key === pendingApproveKey.current && row.review_status === "approved") revealApply(row.note_key);
      })
      .subscribe();

    return () => {
      clearPoll();
      document.removeEventListener("click", handleClick, true);
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
