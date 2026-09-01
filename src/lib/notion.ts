import type {
  BlogPost,
  NotionMarkdownResponse,
  WorkItem,
} from "./types/notion";

export async function getWork(kv?: KVNamespace): Promise<WorkItem[]> {
  const cacheKey = "notion:works";
  if (kv) {
    const cached = await kv.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }
  const res = await fetch(
    `https://api.notion.com/v1/databases/${import.meta.env.NOTION_WORKS_DB}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        filter: {
          property: "status",
          status: { equals: "Done" },
        },
      }),
    },
  );

  if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
  const db = (await res.json()) as any;

  if (!db.results) throw new Error(`Notion API error: ${db.message}`);

  const result: WorkItem[] = db.results.map((page: any) => {
    const props = page.properties;
    return {
      title: props.Name?.title[0]?.plain_text ?? "",
      role: props.role?.rich_text[0]?.plain_text,
      description: props.description?.rich_text[0]?.plain_text,

      ongoing: props.ongoing?.checkbox ?? false,
      date: props.date?.date?.start
        ? new Date(props.date.date.start)
            .toLocaleDateString("en-US", { month: "short", year: "numeric" })
            .toLowerCase() + (props.ongoing?.checkbox ? " –" : "")
        : undefined,
      href: props.link?.url,
      category: props.category?.select?.name,
    };
  });

  if (kv)
    await kv?.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });

  return result;
}
export async function getBlogPosts(kv?: KVNamespace): Promise<BlogPost[]> {
  const cacheKey = "notion:posts";
  if (kv) {
    const cached = await kv.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  const res = await fetch(
    `https://api.notion.com/v1/databases/${import.meta.env.NOTION_POSTS_DB}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        filter: {
          property: "status",
          status: { equals: "Done" },
        },
        sorts: [{ property: "published date", direction: "descending" }],
      }),
    },
  );

  if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
  const db = (await res.json()) as any;

  if (!db.results) throw new Error(`Notion API error: ${db.message}`);

  const result: BlogPost[] = db.results.map((page: any) => {
    const props = page.properties;
    const cover = page.cover
      ? page.cover.type === "external"
        ? page.cover.external.url
        : page.cover.file.url
      : undefined;

    return {
      id: page.id,
      title: props.Name?.title[0]?.plain_text ?? "",
      slug: props.slug?.rich_text[0]?.plain_text ?? "",
      description: props.excerpt?.rich_text[0]?.plain_text,
      date: props["published date"]?.date?.start
        ? new Date(props["published date"].date.start)
            .toLocaleDateString("en-US", { month: "short", year: "numeric" })
            .toLowerCase()
        : undefined,
      cover,
    };
  });

  if (kv)
    await kv.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
  return result;
}

export async function getBlogPostMarkdown(
  pageId: string,
  kv?: KVNamespace,
): Promise<string> {
  const cacheKey = `notion:post:${pageId}`;
  if (kv) {
    const cached = await kv.get(cacheKey);
    if (cached) return cached as string;
  }
  const res = await fetch(
    `https://api.notion.com/v1/pages/${pageId}/markdown`,
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.NOTION_TOKEN}`,
        "Notion-Version": "2026-03-11",
      },
    },
  );

  if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
  const data = (await res.json()) as NotionMarkdownResponse;

  let markdown = data.markdown;

  // if the page was truncated or has permission-restricted child blocks,
  // try to fetch and append them individually
  for (const blockId of data.unknown_block_ids) {
    try {
      const blockRes = await fetch(
        `https://api.notion.com/v1/pages/${blockId}/markdown`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.NOTION_TOKEN}`,
            "Notion-Version": "2026-03-11",
          },
        },
      );
      if (blockRes.ok) {
        const blockData = (await blockRes.json()) as NotionMarkdownResponse;
        markdown += "\n" + blockData.markdown;
      }
    } catch {}
  }

  if (kv) await kv.put(cacheKey, markdown, { expirationTtl: 3600 });
  return markdown;
}
