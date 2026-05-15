import { NextResponse } from 'next/server';

const OWNER = 'tsuppin';
const REPO = 'uma';
const PATH = 'app/lib/constants.ts';
const BRANCH = 'main';

export async function POST(request: Request) {
  try {
    const patch = await request.json();
    if (!patch || !patch.id) {
      return NextResponse.json({ error: 'Invalid patch data' }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    
    // Tokenがない場合のローカル環境用フォールバック
    if (!token) {
      if (process.env.VERCEL) {
        return NextResponse.json({ error: 'GITHUB_TOKEN is not set in Vercel environment variables.' }, { status: 500 });
      }
      
      const { execSync } = require('child_process');
      const fs = require('fs');
      const path = require('path');
      
      const constantsPath = path.join(process.cwd(), 'app', 'lib', 'constants.ts');
      let content = fs.readFileSync(constantsPath, 'utf-8');
      
      const patchCode = `  {
    id: "${patch.id}",
    version: "${patch.version}",
    date: "${patch.date}",
    description: "${patch.description}",
    track: "${patch.track || ''}",
    condition: "${patch.condition || ''}",
    adjustments: ${JSON.stringify(patch.adjustments, null, 2).replace(/\n/g, '\n    ')},
    active: ${patch.active}
  },
];
`;
      content = content.replace(/];[\s\n]*$/, patchCode);
      fs.writeFileSync(constantsPath, content);
      
      execSync(`git add app/lib/constants.ts && git commit -m "feat(ai): auto-add learning patch ${patch.version}" && git push origin main`, { cwd: process.cwd() });
      
      return NextResponse.json({ success: true, message: 'Local git sync successful' });
    }

    // ==========================================
    // GitHub API フロー (Vercel環境・スマホ等からの実行用)
    // ==========================================
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
    
    // 1. ファイルの現状取得 (SHAとContent)
    const getRes = await fetch(apiUrl + `?ref=${BRANCH}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      // Vercelなどでキャッシュされないようにする
      cache: 'no-store'
    });

    if (!getRes.ok) {
      const errTxt = await getRes.text();
      return NextResponse.json({ error: 'Failed to fetch from GitHub API', details: errTxt }, { status: getRes.status });
    }

    const fileData = await getRes.json();
    const currentSha = fileData.sha;
    
    // Base64からUTF-8へデコード
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');

    // 2. 学習パッチの追記
    const patchCode = `  {
    id: "${patch.id}",
    version: "${patch.version}",
    date: "${patch.date}",
    description: "${patch.description}",
    track: "${patch.track || ''}",
    condition: "${patch.condition || ''}",
    adjustments: ${JSON.stringify(patch.adjustments, null, 2).replace(/\n/g, '\n    ')},
    active: ${patch.active}
  },
];
`;

    const newContent = currentContent.replace(/];[\s\n]*$/, patchCode);

    // UTF-8からBase64へエンコード
    const newContentBase64 = Buffer.from(newContent, 'utf8').toString('base64');

    // 3. GitHubへ更新リクエスト (コミット&プッシュに相当)
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `feat(ai): auto-add learning patch ${patch.version}`,
        content: newContentBase64,
        sha: currentSha,
        branch: BRANCH
      })
    });

    if (!putRes.ok) {
      const errTxt = await putRes.text();
      return NextResponse.json({ error: 'Failed to update file via GitHub API', details: errTxt }, { status: putRes.status });
    }

    return NextResponse.json({ success: true, message: 'GitHub API sync successful' });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
