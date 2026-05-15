"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import knowledgeData from "../lib/knowledgeData.json";

export default function KnowledgePanel() {
  const [activeTab, setActiveTab] = useState<"markdowns" | "notebooks" | "python">("markdowns");
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const tabs = [
    { id: "markdowns", label: "📄 分析・ナレッジ" },
    { id: "notebooks", label: "📓 Jupyter Notebooks" },
    { id: "python", label: "🤖 GrandMaster AI" }
  ];

  const currentFiles = knowledgeData[activeTab] || [];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="section-header">
        <h1 className="section-title">📚 ナレッジベース & AI統合</h1>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setSelectedFile(null); }}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '20px', minHeight: '60vh' }}>
        <div style={{ width: '30%', borderRight: '1px solid var(--border-color)', paddingRight: '10px', overflowY: 'auto' }}>
          {currentFiles.map((file: any, index: number) => (
            <div
              key={index}
              onClick={() => setSelectedFile(file)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                borderRadius: '8px',
                marginBottom: '4px',
                backgroundColor: selectedFile?.path === file.path ? 'var(--bg-card)' : 'transparent',
                border: selectedFile?.path === file.path ? '1px solid var(--accent-blue)' : '1px solid transparent',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-main)' }}>{file.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{file.path}</div>
            </div>
          ))}
          {currentFiles.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '20px' }}>
              ファイルがありません
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingLeft: '10px', paddingRight: '10px', paddingBottom: '40px' }}>
          {selectedFile ? (
            <div className="card">
              <div className="card-header">
                <div className="card-title">{selectedFile.name}</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '8px', marginTop: '10px', overflowX: 'auto' }}>
                {selectedFile.name.endsWith('.md') ? (
                  <div className="markdown-body" style={{ color: 'var(--text-main)', lineHeight: '1.6' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedFile.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <pre style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                    {selectedFile.content}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>左側のリストからファイルを選択してください</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
