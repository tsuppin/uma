export interface GithubSettings {
  token: string;
  owner: string;
  repo: string;
  path: string; // e.g. "keiba_data/app_state.json"
}

export function getGithubSettings(): GithubSettings | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('github_settings');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function saveGithubSettings(settings: GithubSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('github_settings', JSON.stringify(settings));
}

// UTF-8 string to Base64 (browser compatible)
function utf8ToBase64(str: string): string {
  return window.btoa(unescape(encodeURIComponent(str)));
}

export async function syncToGitHub(contentJson: string): Promise<boolean> {
  const settings = getGithubSettings();
  if (!settings || !settings.token || !settings.owner || !settings.repo) {
    console.warn("GitHub Settings missing. Skip sync.");
    return false;
  }

  const { token, owner, repo, path } = settings;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path || 'keiba_data/app_state.json'}`;

  try {
    // 1. Get current file sha (if exists)
    let sha = undefined;
    const getRes = await fetch(apiUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (getRes.ok) {
      const getData = await getRes.json();
      sha = getData.sha;
    } else if (getRes.status !== 404) {
      throw new Error(`Failed to fetch current file: ${getRes.statusText}`);
    }

    // 2. Put new file content
    const base64Content = utf8ToBase64(contentJson);
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'chore(sync): auto-sync app_state from mobile',
        content: base64Content,
        sha, // required to update an existing file
      }),
    });

    if (!putRes.ok) {
      const errorData = await putRes.json().catch(() => ({}));
      throw new Error(`Failed to update file: ${putRes.statusText} ${JSON.stringify(errorData)}`);
    }

    console.log("Successfully synced to GitHub!");
    return true;
  } catch (error) {
    console.error("GitHub Sync Error:", error);
    return false;
  }
}
