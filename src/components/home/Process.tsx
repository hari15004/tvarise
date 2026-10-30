import { SectionHead } from "./SectionHead";

type Step = { title: string; text: string };

export function Process({
  index,
  steps,
  placeholder,
  heading,
}: {
  index: string;
  steps: Step[];
  placeholder: boolean;
  heading?: { label: string; title: string };
}) {
  if (steps.length === 0) return null;

  return (
    <section id="process" className="section" aria-label="How we work">
      <div className="container">
        <SectionHead
          index={index}
          label={heading?.label ?? "How we work"}
          title={heading?.title ?? "From idea to launch"}
        />
        <div className="process" data-process>
          <div className="process__line" aria-hidden="true">
            <span data-line-fill />
          </div>
          <ol className="process__list">
            {steps.map((step, i) => (
              <li key={step.title} className="process__step" data-step data-reveal>
                <span className="process__n">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="process__title">{step.title}</h3>
                  <p className="process__text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
