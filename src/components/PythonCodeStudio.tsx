import React, { useState } from 'react';
import { FileCode2, Copy, Check, Terminal, ExternalLink, ShieldCheck, Code, Layers } from 'lucide-react';
import { PYTHON_CODEBASE, PythonFile } from '../data/pythonCode';

export const PythonCodeStudio: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PythonFile>(PYTHON_CODEBASE[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden pb-12">
      {/* File Selector Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar">
          {PYTHON_CODEBASE.map((file) => {
            const isSel = file.path === selectedFile.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
                  isSel
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>{file.name}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-all active:scale-95 shrink-0"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Description Banner */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0">
        <span className="truncate">{selectedFile.description}</span>
        <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">
          Python 3.12 / LangChain 0.3
        </span>
      </div>

      {/* Code Area with line numbers */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-xs text-slate-200 bg-slate-950">
        <div className="flex">
          {/* Line Numbers */}
          <div className="text-slate-600 select-none pr-4 text-right border-r border-slate-800/80 mr-4 font-mono">
            {selectedFile.code.split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Actual Code Text */}
          <pre className="flex-1 leading-relaxed overflow-x-auto custom-scrollbar font-mono text-[11px]">
            <code>{selectedFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
