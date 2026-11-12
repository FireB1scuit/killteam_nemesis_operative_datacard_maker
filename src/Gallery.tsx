import { CardPair } from "./card/CardPair";
import { deriveCard } from "./model/derive";
import { ALL_FIXTURES } from "./model/fixtures";

/** Dev page (?gallery[=id]): renders fixtures at 1:1 for screenshot checks. */
export default function Gallery({ only }: { only?: string }) {
  const list = only ? ALL_FIXTURES.filter((f) => f.id === only) : ALL_FIXTURES;
  return (
    <div style={{ background: "#555", padding: 40, display: "flex", flexDirection: "column", gap: 40, minHeight: "100vh" }}>
      {list.map((f) => (
        <section key={f.id}>
          <h2 style={{ color: "#eee", font: "500 18px Oswald, sans-serif", margin: "0 0 12px" }}>{f.label}</h2>
          <CardPair model={deriveCard(f.build)} image={f.build.image} highlight shadow />
        </section>
      ))}
    </div>
  );
}
