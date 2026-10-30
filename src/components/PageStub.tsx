export function PageStub({ label, title, note }: { label: string; title: string; note: string }) {
  return (
    <section className="page-stub">
      <div className="container">
        <p className="tag" data-reveal>{label}</p>
        <h1 className="page-stub__title" data-reveal>{title}</h1>
        <p className="page-stub__note" data-reveal>{note}</p>
      </div>
    </section>
  );
}
