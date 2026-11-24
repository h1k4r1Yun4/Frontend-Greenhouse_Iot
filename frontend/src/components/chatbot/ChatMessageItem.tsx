import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { ChatMessage, ProposedActuatorAction } from '../../types';
import { ActionProposalCard } from './ActionProposalCard';

export interface ChatMessageItemProps {
  message: ChatMessage;
  onRequestConfirm: (proposal: ProposedActuatorAction) => void;
  onReject: (proposalId: string) => void;
  canExecute?: boolean;
  blockedReason?: string;
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-bold">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return (
        <em key={idx} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-[#EFECE4] text-[#1F2933] font-mono text-[12px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

function renderMarkdownBlocks(text: string): React.ReactNode {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (keyPrefix: number) => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`ul-${keyPrefix}`} className="list-disc pl-5 space-y-1 my-1.5">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((rawLine, idx) => {
    const trimmed = rawLine.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      listItems.push(trimmed.slice(2));
    } else {
      flushList(idx);
      if (trimmed === '') {
        blocks.push(<div key={`sp-${idx}`} className="h-2" />);
      } else {
        blocks.push(
          <p key={`p-${idx}`} className="leading-relaxed">
            {renderInlineMarkdown(rawLine)}
          </p>
        );
      }
    }
  });

  flushList(lines.length);
  return blocks;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRequestConfirm,
  onReject,
  canExecute = true,
  blockedReason,
}) => {
  const isUser = message.sender === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0 border ${
          isUser
            ? 'bg-[#1F2933] border-[#1F2933] text-white'
            : 'bg-[#EAF6EE] border-[#B7E1C6] text-[#15803D]'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Sparkles className="w-4 h-4" aria-hidden="true" />
        )}
      </div>

      {/* Bubble Content */}
      <div className={`max-w-[88%] sm:max-w-[78%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`inline-block text-left p-4 rounded-[18px] text-sm ${
            isUser
              ? 'bg-emerald-600 text-white rounded-tr-[4px] shadow-card'
              : 'bg-white border border-[#E6E1D6] text-[#1F2933] rounded-tl-[4px] shadow-card'
          }`}
        >
          <div className="space-y-1">{renderMarkdownBlocks(message.text)}</div>

          {message.proposedAction && (
            <ActionProposalCard
              proposal={message.proposedAction}
              onRequestConfirm={onRequestConfirm}
              onReject={onReject}
              canExecute={canExecute}
              blockedReason={blockedReason}
            />
          )}
        </div>

        <div
          className={`mt-1 text-[11px] text-[#616E7C] font-mono px-1 flex items-center gap-1.5 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          {!isUser && (
            <span className="text-[#15803D] font-semibold font-sans text-[11px]">
              Trợ lý Nông học AI
            </span>
          )}
          <span className="tabular-nums">{time}</span>
        </div>
      </div>
    </div>
  );
};
