export interface WorkItem {
  title: string;
  role?: string;
  description?: string;
  date?: string;
  href?: string;
  category?: string;
  ongoing?: boolean;
  type: "work";
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description?: string;
  date?: string;
  type: "post";
}

export interface NotionMarkdownResponse {
  object: "page_markdown";
  id: string;
  markdown: string;
  truncated: boolean;
  unknown_block_ids: string[];
}
