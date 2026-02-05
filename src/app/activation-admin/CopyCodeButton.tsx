'use client';

import React from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="ml-2 inline-flex items-center justify-center rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/10"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}
