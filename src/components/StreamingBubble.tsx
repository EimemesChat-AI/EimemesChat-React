// StreamingBubble.tsx — v1.1 — Thinking skeleton UI with animated lines; collapsible after done
import React, { useEffect, useRef, useState } from 'react';
import { renderMarkdown, highlightCodeBlocks, escHtml } from '../lib/markdown';
import { useApp } from '../context/AppContext';
import Disclaimer from './Disclaimer';
import SourcesList from './SourcesList';
import type { Source } from '../types';

interface Props {
  text: string;
  done: boolean;
  model: string;
  disclaimer: 'critical' | 'web' | false;
  time: string;
  sources?: Source[];
  thinking: string;       // accumulated reasoning text
  isThinking: boolean;    // true while reasoning tokens are arriving
}

export default function StreamingBubble({ text, done, model, disclaimer, time, sources, thinking, isThinking }: Props) {
  const { showToast } = useApp();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [thinkExpanded, setThinkExpanded] = useState(false);
  const thinkStartRef = useRef<number>(Date.now());
  const [thinkSeconds, setThinkSeconds] = useState(0);

  // Track how long thinking took
  useEffect(() => {
    if (isThinking) thinkStartRef.current = Date.now();
    if (!isThinking && thinking) {
      setThinkSeconds(Math.round((Date.now() - thinkStartRef.current) / 1000));
    }
  }, [isThinking, thinking]);

  useEffect(() => {
    if (!bodyRef.current) return;
    if (done) {
      bodyRef.current.innerHTML = renderMarkdown(text, '__streaming');
      highlightCodeBlocks(bodyRef.current, showToast);
    } else if (text) {
      bodyRef.current.innerHTML = escHtml(text).replace(/\n/g, '<br>') + '<span class="stream-cursor"></span>';
    }
  }, [text, done, showToast]);

  const showThinkingSkeleton = isThinking && !text;
  const showThinkingPill     = thinking && !isThinking;

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '8px 0' }}>
      <div style={{ width: '100%' }}>

        {/* ── Thinking skeleton — shown while reasoning, before reply ── */}
        {showThinkingSkeleton && (
          <div style={{
            padding: '14px 16px', marginBottom: '10px',
            background: 'var(--glass-2)', borderRadius: '16px',
            border: '1px solid var(--border)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ position: 'relative', width: '16px', height: '16px', flexShrink: 0 }}>
                {/* Pulsing dot */}
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: 'var(--accent)',
                  position: 'absolute', top: '3px', left: '3px',
                  animation: 'think-pulse 1.4s ease-in-out infinite',
                }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-3)' }}>Thinking…</span>
            </div>
            {/* Skeleton lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[88, 72, 80, 55].map((w, i) => (
                <div key={i} style={{
                  height: '11px', borderRadius: '6px',
                  width: `${w}%`,
                  background: 'var(--glass-3)',
                  animation: `skeleton-slide 1.6s ease-in-out ${i * 0.12}s infinite`,
                }} />
              ))}
            </div>
            {/* Live thinking text — dimmed, scrollable */}
            {thinking && (
              <div style={{
                marginTop: '12px', maxHeight: '80px', overflowY: 'auto',
                fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.5,
                fontStyle: 'italic',
              }}>
                {thinking}
              </div>
            )}
          </div>
        )}

        {/* ── Collapsible thinking pill — shown once reply starts ── */}
        {showThinkingPill && (
          <div style={{ marginBottom: '8px' }}>
            <button
              onClick={() => setThinkExpanded(e => !e)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px', borderRadius: '999px',
                background: 'var(--glass-2)', border: '1px solid var(--border)',
                color: 'var(--text-3)', fontSize: '12px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--glass-2)')}
            >
              {/* Brain icon */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
              </svg>
              Thought for {thinkSeconds > 0 ? `${thinkSeconds}s` : 'a moment'}
              <svg
                width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: thinkExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Expanded thinking content */}
            {thinkExpanded && (
              <div style={{
                marginTop: '8px', padding: '12px 14px',
                background: 'var(--glass-2)', borderRadius: '14px',
                border: '1px solid var(--border)',
                fontSize: '13px', color: 'var(--text-3)',
                lineHeight: 1.6, fontStyle: 'italic',
                maxHeight: '200px', overflowY: 'auto',
              }}>
                {thinking}
              </div>
            )}
          </div>
        )}

        {/* ── Reply body ── */}
        {(text || done) && (
          <div
            ref={bodyRef}
            className="msg-body"
            style={{ color: 'var(--text-1)', fontSize: '16px', lineHeight: 1.75, padding: '2px 0' }}
          />
        )}

        {done && (
          <>
            <Disclaimer type={disclaimer} />
            {sources?.length ? <SourcesList sources={sources} msgKey="__streaming" /> : null}
          </>
        )}
      </div>

      <style>{`
        @keyframes think-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
        @keyframes skeleton-slide {
          0%   { opacity: 0.35; }
          50%  { opacity: 0.7; }
          100% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
          
