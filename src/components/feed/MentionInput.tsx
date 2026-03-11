/**
 * MentionInput Component
 *
 * A text input that shows a dropdown of usernames when "@" is typed.
 * Usernames are extracted from the currently loaded posts in the feed.
 * Selecting a username inserts it into the text at the cursor position.
 */
'use client';

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { PaginatedResponse } from '@/types/api';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange?: (mentions: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MentionInput({
  value,
  onChange,
  onMentionsChange,
  placeholder,
  className,
}: MentionInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const mentionsRef = useRef<Set<string>>(new Set());

  const queryClient = useQueryClient();

  // Extract unique usernames from cached post data
  const getUsernames = useCallback((): string[] => {
    const data = queryClient.getQueryData<{ pages: PaginatedResponse[] }>(['posts']);
    if (!data?.pages) return [];
    const names = new Set<string>();
    for (const page of data.pages) {
      for (const post of page.results) {
        names.add(post.username);
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [queryClient]);

  const filtered = getUsernames().filter((name) =>
    name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Detect "@" trigger in input
  const handleChange = (newValue: string) => {
    onChange(newValue);

    const el = inputRef.current;
    if (!el) return;
    const cursor = el.selectionStart ?? newValue.length;

    // Find the "@" before the cursor
    const textBeforeCursor = newValue.slice(0, cursor);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const afterAt = textBeforeCursor.slice(atIndex + 1);
      // Only show if no space in the partial mention
      if (!/\s/.test(afterAt)) {
        setMentionStart(atIndex);
        setMentionQuery(afterAt);
        setShowSuggestions(true);
        setSelectedIndex(0);
        return;
      }
    }

    setShowSuggestions(false);
  };

  const insertMention = (mentionedUsername: string) => {
    const before = value.slice(0, mentionStart);
    const afterCursor = value.slice(mentionStart + 1 + mentionQuery.length);
    const newValue = `${before}@${mentionedUsername} ${afterCursor}`;
    onChange(newValue);
    mentionsRef.current.add(mentionedUsername);
    onMentionsChange?.(Array.from(mentionsRef.current));
    setShowSuggestions(false);

    // Focus back and place cursor after the inserted mention
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        const pos = mentionStart + mentionedUsername.length + 2; // @username + space
        el.focus();
        el.setSelectionRange(pos, pos);
      }
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (showSuggestions && filtered.length > 0) {
        e.preventDefault();
        insertMention(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {showSuggestions && filtered.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full left-0 mb-1 w-56 max-h-40 overflow-y-auto bg-white border border-[#ccc] rounded-lg shadow-lg z-50"
          role="listbox"
        >
          {filtered.map((name, i) => (
            <button
              key={name}
              type="button"
              role="option"
              aria-selected={i === selectedIndex}
              className={[
                'w-full text-left px-3 py-2 text-body transition-colors',
                i === selectedIndex
                  ? 'bg-primary/10 text-primary'
                  : 'text-[#333] hover:bg-[#f5f5f5]',
              ].join(' ')}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click
                insertMention(name);
              }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              @{name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
