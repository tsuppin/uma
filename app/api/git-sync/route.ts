import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const patch = await request.json();
    if (!patch || !patch.id) {
      return NextResponse.json({ error: 'Invalid patch data' }, { status: 400 });
    }

    const constantsPath = path.join(process.cwd(), 'app', 'lib', 'constants.ts');
    let content = fs.readFileSync(constantsPath, 'utf-8');

    // Create the patch code block
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

    // Replace the end of the array with the new patch
    content = content.replace(/];[\s\n]*$/, patchCode);
    fs.writeFileSync(constantsPath, content);

    // Run git commands to commit and push
    return new Promise((resolve) => {
      exec('git add app/lib/constants.ts && git commit -m "feat(ai): auto-add learning patch ' + patch.version + '" && git push origin main', { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return resolve(NextResponse.json({ error: error.message, stderr }, { status: 500 }));
        }
        resolve(NextResponse.json({ success: true, stdout }));
      });
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
