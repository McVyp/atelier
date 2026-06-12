export type WorkItem = {
  title: string;
  role?: string;
  description?: string;
  date?: string;
  href?: string;
  category?: string;
  ongoing?: boolean;
};

export async function getWork(): Promise<WorkItem[]> {
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
  const db = await res.json();

  if (!db.results) throw new Error(`Notion API error: ${db.message}`);

  return db.results.map((page: any) => {
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
}
