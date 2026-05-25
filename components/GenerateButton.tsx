type GenerateButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export default function GenerateButton({
  onClick,
  disabled = false,
}: GenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-12 w-full rounded-lg text-base font-bold text-white shadow transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      style={{ backgroundColor: "var(--lotto-coral)" }}
      aria-label="A부터 E까지 전체 번호 다시 뽑기"
    >
      전체 다시 뽑기
    </button>
  );
}