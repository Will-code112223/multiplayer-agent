import type { ReactNode } from "react";

/**
 * A small Markdown renderer for agent output.
 *
 * It builds React elements directly and never touches `dangerouslySetInnerHTML`,
 * so model output cannot inject markup or scripts into the page. That is the
 * reason this exists rather than a general-purpose library: the input is
 * untrusted text arriving over a socket, and the safest parser is one that has
 * no HTML path at all.
 *
 * It covers the subset language models actually emit - headings, emphasis,
 * inline code, fenced code, lists, block quotes, tables, rules and links - and
 * degrades to plain text for anything else. It also has to survive being handed
 * a half-finished document, because it renders mid-stream.
 */

/** Only these schemes are allowed to become clickable. */
function safeHref(url: string): string | null {
  const trimmed = url.trim();
  return /^(https?:|mailto:)/i.test(trimmed) ? trimmed : null;
}

const INLINE =
  /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*\n]+\*)|(_[^_\n]+_)|(\[[^\]]*\]\([^)\s]+\))|(https?:\/\/[^\s<>()]+)/g;

/** Emphasis, code spans and links inside a line of text. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  INLINE.lastIndex = 0;

  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;

    if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**") || token.startsWith("__")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("[")) {
      const split = token.indexOf("](");
      const label = token.slice(1, split);
      const href = safeHref(token.slice(split + 2, -1));
      nodes.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noreferrer noopener">
            {label || href}
          </a>
        ) : (
          label
        ),
      );
    } else if (token.startsWith("http")) {
      const href = safeHref(token);
      nodes.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noreferrer noopener">
            {token}
          </a>
        ) : (
          token
        ),
      );
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function isTableDivider(line: string): boolean {
  return /^\s*\|?[\s:-]*-[\s:|-]*\|?\s*$/.test(line) && line.includes("-");
}

function splitRow(line: string): string[] {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    // Fenced code. An unterminated fence is normal mid-stream, so it runs to
    // the end of what we have rather than being discarded.
    if (line.trimStart().startsWith("```")) {
      const language = line.trim().slice(3).trim();
      const body: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? "").trimStart().startsWith("```")) {
        body.push(lines[i] ?? "");
        i++;
      }
      i++;
      blocks.push(
        <pre className="md-code" key={`c${i}`} data-language={language || undefined}>
          <code>{body.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1]!.length;
      const Tag = `h${Math.min(level + 2, 6)}` as "h3" | "h4" | "h5" | "h6";
      blocks.push(
        <Tag className="md-h" key={`h${i}`} data-level={level}>
          {inline(heading[2] ?? "", `h${i}`)}
        </Tag>,
      );
      i++;
      continue;
    }

    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      blocks.push(<hr className="md-hr" key={`r${i}`} />);
      i++;
      continue;
    }

    // Table: a header row followed by a |---|---| divider.
    if (line.includes("|") && isTableDivider(lines[i + 1] ?? "")) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && (lines[i] ?? "").includes("|") && (lines[i] ?? "").trim()) {
        rows.push(splitRow(lines[i] ?? ""));
        i++;
      }
      blocks.push(
        <div className="md-table-wrap" key={`t${i}`}>
          <table className="md-table">
            <thead>
              <tr>
                {header.map((cell, c) => (
                  <th key={c}>{inline(cell, `th${i}-${c}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c}>{inline(cell, `td${i}-${r}-${c}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i] ?? "")) {
        body.push((lines[i] ?? "").replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote className="md-quote" key={`q${i}`}>
          {inline(body.join(" "), `q${i}`)}
        </blockquote>,
      );
      continue;
    }

    const bullet = /^\s*[-*+]\s+/;
    const numbered = /^\s*\d+[.)]\s+/;
    if (bullet.test(line) || numbered.test(line)) {
      const ordered = numbered.test(line);
      const pattern = ordered ? numbered : bullet;
      const items: string[] = [];
      while (i < lines.length && pattern.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(pattern, ""));
        i++;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List className="md-list" key={`l${i}`}>
          {items.map((item, n) => (
            <li key={n}>{inline(item, `li${i}-${n}`)}</li>
          ))}
        </List>,
      );
      continue;
    }

    // Paragraph: consecutive plain lines belong together.
    const paragraph: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !/^\s*([-*+]|\d+[.)])\s+/.test(lines[i] ?? "") &&
      !/^\s*>/.test(lines[i] ?? "") &&
      !/^#{1,6}\s/.test(lines[i] ?? "") &&
      !(lines[i] ?? "").trimStart().startsWith("```")
    ) {
      paragraph.push(lines[i] ?? "");
      i++;
    }
    blocks.push(
      <p className="md-p" key={`p${i}`}>
        {inline(paragraph.join("\n"), `p${i}`)}
      </p>,
    );
  }

  return <div className="md">{blocks}</div>;
}
