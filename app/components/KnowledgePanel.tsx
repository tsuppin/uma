"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import knowledgeData from "../lib/knowledgeData.json";

interface KnowledgeFile {
  name: string;
  path: string;
  content: string;
}

export default function KnowledgePanel() {
  const [activeTab, setActiveTab] = useState<"markdowns" | "notebooks" | "python">("markdowns");
  const [selectedFile, setSelectedFile] = useState<KnowledgeFile | null>(null);

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
            type="button"
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as "markdowns" | "notebooks" | "python"); setSelectedFile(null); }}
            className={`btn ${activeTab === tab.id ? "btn-primary" : "btn-secondary"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 gap-20 min-h-300">
        <div className="w-110 border-right pr-10 overflow-y-auto" style={{ width: "30%" }}>
          {currentFiles.map((file: KnowledgeFile, index: number) => (
            <button
              type="button"
              key={index}
              onClick={() => setSelectedFile(file)}
              className={`w-full text-left p-10 pointer rounded-8 mb-4 border transition-all ${selectedFile?.path === file.path ? "bg-card border-gold" : "bg-transparent border-transparent hover-bg-surface"}`}
            >
              <div className="fw-700 fs-md text-primary">{file.name}</div>
              <div className="fs-xs text-muted ellipsis">{file.path}</div>
            </button>
          ))}
          {currentFiles.length === 0 && (
            <div className="text-muted fs-md mt-20">
              ファイルがありません
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pl-10 pr-10 pb-40">
          {selectedFile ? (
            <div className="card m-0">
              <div className="card-header">
                <div className="card-title">{selectedFile.name}</div>
              </div>
              <div className="p-16 bg-card rounded-8 mt-10 overflow-x-auto">
                {selectedFile.name.endsWith(".md") ? (
                  <div className="markdown-body text-primary lh-1-6">
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
