export async function getGithubActivity() {
  const res = await fetch(
    `https://api.github.com/users/${import.meta.env.GITHUB_USERNAME}/events/public`,
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
        "User-Agent": "atelier-portfolio",
      },
    },
  );
  const events = await res.json();

  return events
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
}

export async function getGithubStats() {
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

  const { data } = await res.json();
  const user = data.user;
  return {
    contributions:
      user.contributionsCollection.contributionCalendar.totalContributions,
  };
}
