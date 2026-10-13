import { Fragment } from "react";

// Renders text as words, each inside a clipping mask. The animation code slides
// every [data-mask] element up from below its mask.
export function MaskedWords({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          <span className="mask">
            <span className="mask__inner" data-mask>
              {word}
            </span>
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}
