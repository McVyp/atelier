import { marked } from "marked";

export interface TocItem {
  depth: number;
  text: string;
  slug: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function renderWithToc(markdown: string): {
  html: string;
  headings: TocItem[];
} {
  const headings: TocItem[] = [];
  const slugCounts = new Map<string, number>();

  const renderer = new marked.Renderer();

  renderer.heading = ({ tokens, depth }: any) => {
    const plain = tokens.reduce(
      (acc: string, t: any) => acc + (t.text ?? t.raw ?? ""),
      "",
    );
    const base = slugify(plain);
    const count = slugCounts.get(base) ?? 0;
    slugCounts.set(base, count + 1);
    const slug = count === 0 ? base : `${base}-${count}`;

    if (depth === 2 || depth === 3) {
      headings.push({ depth, text: plain, slug });
    }

    const inner = marked.parseInline(plain) as string;
    return `<h${depth} id="${slug}">${inner}</h${depth}>\n`;
  };

  const html = marked.parse(markdown, { renderer }) as string;
  return { html, headings };
}
