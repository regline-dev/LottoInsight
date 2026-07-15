"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import NumberResult from "@/components/NumberResult";
import { EMPTY_LOTTO_DRAW, type LottoDraw } from "@/lib/lotto/types";

type MyNumberModalProps = {
  open: boolean;
  gameLabel: string;
  /** 저장본 없으면 null */
  savedDraw: LottoDraw | null;
  /** 지금 용지 번호 */
  currentDraw: LottoDraw;
  onClose: () => void;
  onSave: () => void;
  onLoad: () => void;
  onUpdate: () => void;
};

/** 나의번호등록 모달 — body 포탈 + Esc/배경/스크롤 잠금 */
export default function MyNumberModal({
  open,
  gameLabel,
  savedDraw,
  currentDraw,
  onClose,
  onSave,
  onLoad,
  onUpdate,
}: MyNumberModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const hasSaved = savedDraw != null;
  const hasCurrentNumbers = currentDraw.mainNumbers.length > 0;
  /** 저장 없음 + 용지도 비어 있음 → 저장 불가 */
  const cannotSaveEmpty = !hasSaved && !hasCurrentNumbers;

  useEffect(() => {
    if (!open) {
      return;
    }

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const focusTarget = dialogRef.current?.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      focusTarget?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const previewDraw = hasSaved
    ? savedDraw
    : hasCurrentNumbers
      ? currentDraw
      : EMPTY_LOTTO_DRAW;

  return createPortal(
    <div className="my-number-modal" role="presentation">
      <button
        type="button"
        className="my-number-modal__backdrop"
        aria-label="모달 닫기"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="my-number-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="my-number-modal__header">
          <h2 id={titleId} className="my-number-modal__title">
            나의번호 · {gameLabel}
          </h2>
          <button
            type="button"
            className="my-number-modal__close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <p className="my-number-modal__hint">
          {cannotSaveEmpty
            ? "선택된 번호가 없어 저장할 수 없습니다."
            : hasSaved
              ? "저장된 번호입니다. 가져가거나 지금 용지 번호로 수정하세요."
              : "용지 번호를 저장합니다. (1~6개)"}
        </p>

        <div className="my-number-modal__balls">
          <NumberResult draw={previewDraw} emptyStyle="outline" />
        </div>

        <div className="my-number-modal__actions">
          {cannotSaveEmpty ? (
            <button
              type="button"
              className="my-number-modal__btn my-number-modal__btn--secondary"
              onClick={onClose}
            >
              닫기
            </button>
          ) : hasSaved ? (
            <>
              <button
                type="button"
                className="my-number-modal__btn my-number-modal__btn--primary"
                onClick={onLoad}
              >
                가져가기
              </button>
              <button
                type="button"
                className="my-number-modal__btn my-number-modal__btn--secondary"
                onClick={onUpdate}
              >
                수정하기
              </button>
            </>
          ) : (
            <button
              type="button"
              className="my-number-modal__btn my-number-modal__btn--primary"
              onClick={onSave}
            >
              저장
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
