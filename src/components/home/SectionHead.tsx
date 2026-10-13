type Props = { index: string; label: string; title: string; text?: string };

// Numbered section header (001, 002, ...). Reveals on scroll.
export function SectionHead({ index, label, title, text }: Props) {
  return (
    <header className="sec-head">
      <p className="sec-label" data-reveal>
        <span className="sec-label__n">{index}</span>
        {label}
      </p>
      <h2 className="sec-title" data-reveal>
        {title}
      </h2>
      {text && (
        <p className="sec-text" data-reveal>
          {text}
        </p>
      )}
    </header>
  );
}
