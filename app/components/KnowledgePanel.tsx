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
    <div className="fade-in flex flex-col h-full">
      <div className="section-header">
        <h1 className="section-title">📚 ナレッジベース & AI統合</h1>
      </div>

      <div className="flex gap-10 mb-16">
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

      <div className="flex flex-1 gap-20 min-h-60vh">
        <div className="border-right pr-10 overflow-y-auto" style={{ width: '30%' }}>
          {currentFiles.map((file: any, index: number) => (
            <div
              key={index}
              onClick={() => setSelectedFile(file)}
              className={`p-10 pointer rounded-8 mb-4 border-transparent ${selectedFile?.path === file.path ? 'bg-card border-gold' : ''}`}
            >
              <div className="fw-700 fs-md text-main">{file.name}</div>
              <div className="fs-xs text-muted">{file.path}</div>
            </div>
          ))}
          {currentFiles.length === 0 && (
            <div className="text-muted fs-md mt-20">
              ファイルがありません
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pl-10 pr-10 pb-40">
          {selectedFile ? (
            <div className="card">
              <div className="card-header">
                <div className="card-title">{selectedFile.name}</div>
              </div>
              <div className="p-16 bg-card rounded-8 mt-10 overflow-x-auto">
                {selectedFile.name.endsWith('.md') ? (
                  <div className="markdown-body text-main" style={{ lineHeight: '1.6' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedFile.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <pre className="m-0 fs-sm text-muted pre-wrap">
                    {selectedFile.content}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state h-full flex items-center justify-center">
              <div>左側のリストからファイルを選択してください</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
