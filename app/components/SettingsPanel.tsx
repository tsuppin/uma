"use client";
import { useState, useEffect } from "react";
import { getGithubSettings, saveGithubSettings, GithubSettings, syncToGitHub } from "../lib/githubSync";
import { AppState } from "../types";

export default function SettingsPanel({ state }: { state: AppState }) {
  const [settings, setSettings] = useState<GithubSettings>({
    token: "",
    owner: "tsuppin",
    repo: "uma",
    path: "keiba_data/app_state.json",
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = getGithubSettings();
    if (saved) {
      setSettings(saved);
    }
  }, []);

  const handleSave = () => {
    saveGithubSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestSync = async () => {
    setIsSyncing(true);
    setSyncStatus("⏳ 同期中...");
    
    // Save settings first
    saveGithubSettings(settings);

    const success = await syncToGitHub(JSON.stringify(state));
    
    if (success) {
      setSyncStatus("✅ 同期に成功しました！");
    } else {
      setSyncStatus("❌ 同期に失敗しました。トークンやリポジトリ名を確認してください。");
    }
    setIsSyncing(false);
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h1 className="section-title">⚙️ 設定・同期</h1>
        <div className="fs-xs text-muted">
          スマホのデータをGitHubに自動バックアップするための設定
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">🐙 GitHub 自動同期設定</div>
        </div>

        <div className="alert alert-info mb-16 fs-sm">
          💡 ここで設定した情報は、お使いのスマホ（ブラウザ）の内部にのみ保存され、外部のサーバーには送信されません。
          レース情報や予想を追加したタイミングで、自動的にGitHubのファイルが更新されます。
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="gh-token">Personal Access Token (PAT) *</label>
          <input
            id="gh-token"
            type="password"
            className="form-input"
            value={settings.token}
            onChange={(e) => setSettings({ ...settings, token: e.target.value })}
            placeholder="ghp_xxxxxxxxxxxxxxxxx"
          />
          <div className="fs-xs text-muted mt-4">
            ※リポジトリへの読み書き権限（Contents: Read & Write）が必要です。
          </div>
        </div>

        <div className="grid-2 gap-12 mb-16">
          <div className="form-group">
            <label className="form-label" htmlFor="gh-owner">オーナー名</label>
            <input
              id="gh-owner"
              className="form-input"
              value={settings.owner}
              onChange={(e) => setSettings({ ...settings, owner: e.target.value })}
              placeholder="例: tsuppin"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="gh-repo">リポジトリ名</label>
            <input
              id="gh-repo"
              className="form-input"
              value={settings.repo}
              onChange={(e) => setSettings({ ...settings, repo: e.target.value })}
              placeholder="例: uma"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="gh-path">保存先ファイルパス</label>
          <input
            id="gh-path"
            className="form-input"
            value={settings.path}
            onChange={(e) => setSettings({ ...settings, path: e.target.value })}
            placeholder="例: keiba_data/app_state.json"
          />
        </div>

        <div className="flex gap-8 mt-24">
          <button className="btn btn-primary" onClick={handleSave}>
            💾 設定を保存
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleTestSync}
            disabled={isSyncing || !settings.token || !settings.owner || !settings.repo}
          >
            {isSyncing ? "⏳ 同期中..." : "🔄 今すぐ手動同期（テスト）"}
          </button>
        </div>

        {isSaved && <div className="text-green mt-8 fs-sm">✅ 設定を保存しました</div>}
        {syncStatus && (
          <div className={`mt-8 fs-sm ${syncStatus.includes("✅") ? "text-green" : "text-red"}`}>
            {syncStatus}
          </div>
        )}
      </div>

      <div className="card mt-16" style={{ opacity: 0.85 }}>
        <div className="card-header">
          <div className="card-title">📝 GitHub トークンの取得方法</div>
        </div>
        <div className="fs-sm">
          <ol style={{ paddingLeft: "20px", marginTop: "8px" }}>
            <li className="mb-4">GitHubにログインし、右上のアイコンから <b>Settings</b> を開く</li>
            <li className="mb-4">左メニューの一番下 <b>Developer settings</b> → <b>Personal access tokens</b> → <b>Fine-grained tokens</b> を選択</li>
            <li className="mb-4"><b>Generate new token</b> をクリック</li>
            <li className="mb-4">Token name に「uma-sync」などと入力し、Expiration（期限）を適宜設定</li>
            <li className="mb-4">Repository access で対象リポジトリ（uma）を選択</li>
            <li className="mb-4">Permissions の <b>Contents</b> を <b>Read and write</b> に変更</li>
            <li className="mb-4">生成された <code>github_pat_...</code> で始まるトークンをコピーして、上に貼り付けてください</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
