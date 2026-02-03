import React from 'react';

/**
 * MarkdownRenderer - Beautiful markdown display component
 * Renders AI responses with proper formatting for headings, lists, code, bold, etc.
 */
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  const parseMarkdown = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Skip empty lines
      if (!line.trim()) {
        i++;
        continue;
      }

      // Headings (## Heading)
      if (line.startsWith('###')) {
        elements.push(
          <h3 key={i} className="text-lg font-bold text-gray-800 mt-6 mb-3 flex items-center gap-2">
            <span className="text-purple-600">▸</span>
            {parseInline(line.replace(/^###\s*/, ''))}
          </h3>
        );
        i++;
      } else if (line.startsWith('##')) {
        elements.push(
          <h2 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-purple-200">
            {parseInline(line.replace(/^##\s*/, ''))}
          </h2>
        );
        i++;
      } else if (line.startsWith('#')) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-gray-900 mt-6 mb-4">
            {parseInline(line.replace(/^#\s*/, ''))}
          </h1>
        );
        i++;
      }
      // Code blocks (```language ... ```)
      else if (line.startsWith('```')) {
        const codeLines = [];
        const language = line.replace('```', '').trim() || 'code';
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <div key={i} className="my-4 rounded-xl overflow-hidden border border-gray-200">
            <div className="bg-gray-800 px-4 py-2 text-xs text-gray-300 font-mono flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="ml-2">{language}</span>
            </div>
            <pre className="bg-gray-900 p-4 overflow-x-auto">
              <code className="text-sm text-green-400 font-mono">
                {codeLines.join('\n')}
              </code>
            </pre>
          </div>
        );
        i++; // Skip closing ```
      }
      // Numbered lists (1. item)
      else if (/^\d+\.\s/.test(line)) {
        const listItems = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          listItems.push(
            <li key={i} className="ml-6 mb-2 flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-semibold">
                {listItems.length + 1}
              </span>
              <span className="flex-1 pt-0.5">{parseInline(lines[i].replace(/^\d+\.\s*/, ''))}</span>
            </li>
          );
          i++;
        }
        elements.push(
          <ol key={`ol-${i}`} className="my-4">
            {listItems}
          </ol>
        );
      }
      // Bullet lists (* item or - item)
      else if (line.startsWith('* ') || line.startsWith('- ')) {
        const listItems = [];
        while (i < lines.length && (lines[i].startsWith('* ') || lines[i].startsWith('- '))) {
          const content = lines[i].replace(/^[*-]\s*/, '');
          listItems.push(
            <li key={i} className="ml-6 mb-2 flex items-start gap-3">
              <span className="text-purple-600 text-lg flex-shrink-0">•</span>
              <span className="flex-1">{parseInline(content)}</span>
            </li>
          );
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="my-4">
            {listItems}
          </ul>
        );
      }
      // Blockquotes (> text)
      else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="border-l-4 border-purple-500 bg-purple-50 pl-4 py-3 my-4 italic text-gray-700">
            {parseInline(line.replace(/^>\s*/, ''))}
          </blockquote>
        );
        i++;
      }
      // Horizontal rule (---)
      else if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={i} className="my-6 border-t-2 border-gray-200" />);
        i++;
      }
      // Regular paragraph
      else {
        elements.push(
          <p key={i} className="mb-4 text-gray-700 leading-relaxed">
            {parseInline(line)}
          </p>
        );
        i++;
      }
    }

    return elements;
  };

  // Parse inline markdown: **bold**, *italic*, `code`, [link](url)
  const parseInline = (text) => {
    const parts = [];
    let currentText = text;
    let key = 0;

    // Process inline markdown patterns
    const patterns = [
      { regex: /\*\*(.+?)\*\*/g, render: (match) => <strong key={key++} className="font-bold text-gray-900">{match}</strong> },
      { regex: /\*(.+?)\*/g, render: (match) => <em key={key++} className="italic">{match}</em> },
      { regex: /`(.+?)`/g, render: (match) => <code key={key++} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono text-sm">{match}</code> },
      { regex: /\[(.+?)\]\((.+?)\)/g, render: (match, url) => <a key={key++} href={url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{match}</a> },
    ];

    // Split text by patterns and render
    let result = [currentText];
    
    patterns.forEach(({ regex, render }) => {
      result = result.flatMap(part => {
        if (typeof part !== 'string') return part;
        
        const segments = [];
        let lastIndex = 0;
        const matches = [...part.matchAll(regex)];
        
        matches.forEach(match => {
          if (match.index > lastIndex) {
            segments.push(part.slice(lastIndex, match.index));
          }
          segments.push(render(match[1], match[2]));
          lastIndex = match.index + match[0].length;
        });
        
        if (lastIndex < part.length) {
          segments.push(part.slice(lastIndex));
        }
        
        return segments.length > 0 ? segments : [part];
      });
    });

    return result;
  };

  return (
    <div className="markdown-content">
      {parseMarkdown(content)}
    </div>
  );
}
