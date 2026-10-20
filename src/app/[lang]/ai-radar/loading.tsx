export default function RadarLoading() {
  return (
    <div
      className="shell min-h-[70vh] pb-16 pt-32"
      role="status"
      aria-label="AI Radar"
      aria-busy="true"
    >
      <div className="h-4 w-40 rounded bg-mist" />
      <div className="mt-7 h-20 w-3/4 max-w-lg rounded-xl bg-mist" />
      <div className="mt-8 h-16 rounded-2xl border border-line bg-cloud" />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-72 rounded-2xl border border-line bg-cloud"
          />
        ))}
      </div>
    </div>
  );
}
