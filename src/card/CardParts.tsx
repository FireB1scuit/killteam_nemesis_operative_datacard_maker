import type { ReactNode } from "react";
import type { AbilityBlock, CardModel } from "../model/derive";
import type { BuildImage } from "../model/schema";
import { IconControl, IconMove, IconSave, IconWounds, PortraitPlaceholder } from "./icons";

export function Portrait({ image }: { image?: BuildImage }) {
  if (!image) return <div className="pic"><PortraitPlaceholder /></div>;
  const origin = `${image.x}% ${image.y}%`;
  return (
    <div className="pic">
      <img
        src={image.dataUrl}
        alt=""
        draggable={false}
        style={{ objectPosition: origin, transformOrigin: origin, transform: `scale(${image.zoom})` }}
      />
    </div>
  );
}

export function CardHeader({ model, image }: { model: CardModel; image?: BuildImage }) {
  const { stats } = model;
  return (
    <header className="kt-head">
      <div className="name">
        <h1 data-fit="name">{model.name || "Unnamed operative"}</h1>
        {model.moniker && <div className="moniker" data-fit="moniker">‘{model.moniker}’</div>}
      </div>
      <Portrait image={image} />
      <div className="stats">
        <Stat label="Control" small icon={<IconControl />} value={stats.control} />
        <Stat label="Move" icon={<IconMove />} value={`${stats.move}"`} />
        <Stat label="Save" icon={<IconSave />} value={<>{stats.save}<span className="plus">+</span></>} />
        <Stat label="Wounds" icon={<IconWounds />} value={stats.wounds} />
      </div>
    </header>
  );
}

function Stat({ label, icon, value, small }: { label: string; icon: ReactNode; value: ReactNode; small?: boolean }) {
  return (
    <div className="stat">
      <div className={small ? "k small" : "k"}>{label}</div>
      <div className="v">{icon}{value}</div>
    </div>
  );
}

export function CardFooter({ model, page }: { model: CardModel; page: string }) {
  const { keywords, base } = model;
  const longBase = base.label.length > 3;
  return (
    <footer className="kt-foot">
      <div className="kw">
        {keywords.allegiance && <span className="fk">{keywords.allegiance}</span>}
        {keywords.allegiance && ", "}
        {keywords.rest.join(", ")}
      </div>
      <div className="sz">{model.operativeType === "npo" ? "NPO · " : ""}{model.sizeLabel}</div>
      <div className="pg">{page}</div>
      {base.label && <div className={`base${base.kind === "oval" ? " oval" : longBase ? " long" : ""}`}>{base.label}</div>}
    </footer>
  );
}

export function AbilityView({ block }: { block: AbilityBlock }) {
  if (block.kind === "action") return null; // rendered by RulesCard
  const paras = block.text ? block.text.split(/\n\s*\n/) : [];
  return (
    <div className="ab" data-key={block.key}>
      <p>
        <b>{block.name}:</b>
        {paras[0] && <> {paras[0]}</>}
        {block.note && <> <i>{block.note}</i>.</>}
      </p>
      {paras.slice(1).map((t, i) => <p key={i}>{t}</p>)}
      {block.bullets && (
        <ul>
          {block.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}
    </div>
  );
}
