import React, { useState } from 'react';
import { Sparkles, KeyRound, AlertCircle, TrendingDown, Lightbulb, ShieldAlert, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Expense } from '../hooks/use-expenses';

function sanitize(str: unknown): string {
  return String(str)
    .replace(/\\/g, '')
    .replace(/"/g, "'")
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ')
    .trim();
}

interface AIAnalysisProps {
  expenses: Expense[];
}

interface AIResult {
  insights: string[];
  tips: string[];
  warnings: string[];
}

export function AIAnalysis({ expenses }: AIAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  const handleAnalyze = async () => {
    if (!API_KEY) {
      setError("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your Replit secrets.");
      return;
    }

    if (expenses.length < 3) {
      setError("Please add at least 3 expenses for a meaningful AI analysis.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryMap: Record<string, number> = {};
    expenses.forEach(e => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });
    const categoryList = Object.entries(categoryMap)
      .map(([k, v]) => `${sanitize(k)}: Rs.${sanitize(v)}`)
      .join(', ');
    const recent = expenses
      .slice(0, 5)
      .map(e => `${sanitize(e.name)} (${sanitize(e.category)}) - Rs.${sanitize(e.amount)} on ${sanitize(e.date)}`)
      .join(' | ');

    const prompt =
      'You are a financial advisor for Indian college students. Analyze this expense data and respond ONLY with a valid JSON object - no markdown, no explanation, no backticks. ' +
      `Total spent: Rs.${sanitize(totalSpent)}. ` +
      `Categories: ${categoryList}. ` +
      `Recent expenses: ${recent}. ` +
      'Respond with exactly this JSON format: ' +
      '{"insights":["insight 1","insight 2","insight 3"],"tips":["tip 1","tip 2","tip 3"],"warnings":["warning 1","warning 2"]}';

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
          })
        }
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const msg = (errJson as any)?.error?.message || `API error (${response.status})`;
        throw new Error(msg);
      }

      const data = await response.json();
      let rawText: string = data.candidates[0].content.parts[0].text;
      rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(rawText) as AIResult;
      if (!Array.isArray(parsed.insights) || !Array.isArray(parsed.tips) || !Array.isArray(parsed.warnings)) {
        throw new Error("Unexpected response format from Gemini.");
      }

      setResult(parsed);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-5xl mx-auto w-full">

      {/* Missing API key warning */}
      {!API_KEY && (
        <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 text-orange-800">
          <KeyRound className="flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold">Gemini API Key Missing</h4>
            <p className="text-sm mt-1">
              To use AI Analysis, add <code className="bg-orange-100 px-1 rounded">VITE_GEMINI_API_KEY</code> to your
              Replit secrets. Get a free key at{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="underline font-medium">
                aistudio.google.com
              </a>.
            </p>
          </div>
        </div>
      )}

      {/* Not enough data warning */}
      {API_KEY && expenses.length < 3 && !result && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-blue-800">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold">Need more data</h4>
            <p className="text-sm mt-1">Add at least 3 expenses for the AI to generate meaningful insights.</p>
          </div>
        </div>
      )}

      {/* Hero / Trigger */}
      <div className="text-center py-10 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 mb-10 shadow-inner">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center text-primary mb-6">
          <Sparkles size={32} />
        </div>
        <h2 className="text-3xl font-bold text-indigo-950 mb-3">Gemini Financial Analyst</h2>
        <p className="text-indigo-700 max-w-lg mx-auto mb-8">
          Let AI analyze your spending patterns, spot trends, and give personalised tips to stretch your budget further.
        </p>

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !API_KEY || expenses.length < 3}
          className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all inline-flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Analyzing your data…
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Analyze My Spending
            </>
          )}
        </button>

        {error && (
          <p className="text-destructive mt-4 text-sm font-medium">{error}</p>
        )}
      </div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Insights */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <TrendingDown size={20} />
              </div>
              <h3 className="text-lg font-bold">Key Insights</h3>
            </div>
            <ul className="space-y-4">
              {result.insights.map((item, i) => (
                <li key={i} className="flex gap-3 text-muted-foreground text-sm">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Lightbulb size={20} />
              </div>
              <h3 className="text-lg font-bold">Savings Tips</h3>
            </div>
            <ul className="space-y-4">
              {result.tips.map((item, i) => (
                <li key={i} className="flex gap-3 text-muted-foreground text-sm">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Warnings */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-lg font-bold">Warnings</h3>
            </div>
            <ul className="space-y-4">
              {result.warnings.map((item, i) => (
                <li key={i} className="flex gap-3 text-muted-foreground text-sm">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
