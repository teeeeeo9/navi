import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { Components } from 'react-markdown';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const components: Components = {
    // Headings
    h1: ({ children }) => (
      <h1 className="text-xl font-bold text-white mb-3 mt-4 first:mt-0 border-b border-white/20 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-bold text-white mb-2 mt-3 first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold text-white mb-2 mt-3 first:mt-0">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-sm font-semibold text-white mb-1 mt-2 first:mt-0">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-sm font-medium text-white mb-1 mt-2 first:mt-0">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-xs font-medium text-white mb-1 mt-2 first:mt-0">
        {children}
      </h6>
    ),
    
    // Paragraphs
    p: ({ children }) => (
      <p className="text-sm text-white mb-2 last:mb-0 leading-relaxed">
        {children}
      </p>
    ),
    
    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-2 space-y-1 ml-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-2 space-y-1 ml-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-sm text-white">
        {children}
      </li>
    ),
    
    // Links
    a: ({ href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 transition-colors"
      >
        {children}
      </a>
    ),
    
    // Code
    code: ({ node, inline, className, children, ...props }: CodeProps & any) => {
      if (inline) {
        return (
          <code 
            className="bg-gray-800/80 text-orange-300 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-600/50"
            {...props}
          >
            {children}
          </code>
        );
      }
      
      return (
        <code 
          className={`block bg-gray-900/90 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto border border-gray-600/30 ${className || ''}`}
          {...props}
        >
          {children}
        </code>
      );
    },
    
    // Pre (code blocks)
    pre: ({ children }) => (
      <pre className="bg-gray-900/90 rounded-lg overflow-x-auto mb-3 border border-gray-600/30">
        {children}
      </pre>
    ),
    
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-400/50 pl-4 italic text-gray-300 mb-3 bg-gray-800/30 py-2 rounded-r">
        {children}
      </blockquote>
    ),
    
    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto mb-3">
        <table className="min-w-full border-collapse border border-gray-600/50 rounded-lg overflow-hidden">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-800/80">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="bg-gray-900/40">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="border-b border-gray-600/30">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 text-left text-xs font-medium text-white border-r border-gray-600/30 last:border-r-0">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 text-xs text-gray-200 border-r border-gray-600/30 last:border-r-0">
        {children}
      </td>
    ),
    
    // Horizontal rule
    hr: () => (
      <hr className="border-gray-600/50 my-4" />
    ),
    
    // Strong/Bold
    strong: ({ children }) => (
      <strong className="font-bold text-white">
        {children}
      </strong>
    ),
    
    // Emphasis/Italic
    em: ({ children }) => (
      <em className="italic text-gray-200">
        {children}
      </em>
    ),
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer; 