export async function getGithubActivity(kv?: KVNamespace) {
  const cacheKey = "github:activity";

  if (kv) {
    const cached = await kv.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  const res = await fetch(
    `https://api.github.com/users/${import.meta.env.GITHUB_USERNAME}/events/public`,
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
        "User-Agent": "atelier-portfolio",
      },
    },
  );

  const events = (await res.json()) as any[];

  const result = events
    .map((e: any) => ({
      title: e.repo.name,
      description:
        e.type === "PushEvent"
          ? e.payload.commits?.[0]?.message
          : e.type === "PullRequestEvent"
            ? e.payload.pull_request?.title
            : e.type === "CreateEvent"
              ? `Created ${e.payload.ref_type} ${e.payload.ref ?? ""}`
              : e.type === "IssuesEvent"
                ? e.payload.issue?.title
                : null,
      date: e.created_at.split("T")[0],
      href: `https://github.com/${e.repo.name}`,
      type: "activity" as const,
    }))
    .filter((item: any) => item.description?.trim());

  if (kv)
    await kv.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });

  return result;
}

export async function getGithubStats(kv?: KVNamespace) {
  const cacheKey = "github:stats";

  if (kv) {
    const cached = await kv.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  const query = `{
    user(login: "${import.meta.env.GITHUB_USERNAME}") {
      contributionsCollection {
        contributionCalendar {
          totalContributions
        }
      }
      followers { totalCount }
      publicRepos: repositories(privacy: PUBLIC) { totalCount }
    }
  }`;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
      "User-Agent": "atelier-portfolio",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const { data } = (await res.json()) as any;
  const user = data.user;

  const result = {
    contributions:
      user.contributionsCollection.contributionCalendar.totalContributions,
  };

  if (kv)
    await kv.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });

  return result;
}
