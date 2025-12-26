
import React, { useState } from 'react';
import { Lead, ExtractionStatus, SearchParams } from './types';
import { extractLeadsWithGemini } from './services/geminiService';
import { downloadLeadsAsCSV } from './utils/csvHelper';
import LeadTable from './components/LeadTable';

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>('');
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: '',
    location: '',
    sourceType: 'maps'
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.keyword || !searchParams.location) return;

    setStatus('searching');
    setError(null);
    setLoadingMsg(searchParams.sourceType === 'maps' 
      ? 'Gathering deep insights from Google Maps...' 
      : 'Indexing business directories and websites...');

    try {
      // Increased timeout to 90 seconds to handle deep searches and large JSON generations
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('The search engine is taking longer than usual. Please try a more specific search area or keyword.')), 90000)
      );

      const result = await Promise.race([
        extractLeadsWithGemini(searchParams),
        timeoutPromise
      ]) as Lead[];

      if (result.length === 0) {
        setError('No businesses were found. Try modifying your keyword or location.');
        setStatus('idle');
      } else {
        setLeads(prev => {
          // Filter out duplicates based on name and address
          const combined = [...result, ...prev];
          const seen = new Set();
          return combined.filter(lead => {
            const key = `${lead.name}-${lead.address}`.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        });
        setStatus('completed');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'The AI service encountered an issue. Try again in a few moments.');
      setStatus('error');
    } finally {
      setLoadingMsg('');
    }
  };

  const handleClear = () => {
    setLeads([]);
    setStatus('idle');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">LeadGen Pro</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">AI-Powered Contact Discovery</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => downloadLeadsAsCSV(leads)}
              disabled={leads.length === 0}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all
                ${leads.length > 0 
                  ? 'bg-zinc-100 text-zinc-950 hover:bg-white active:scale-95 shadow-lg' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV ({leads.length})
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-4 flex flex-col space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Industry / Niche</label>
              <input 
                type="text"
                placeholder="e.g. Dentists, Marketing Agencies"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder:text-zinc-800"
                value={searchParams.keyword}
                onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-3 flex flex-col space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Target City</label>
              <input 
                type="text"
                placeholder="City, Region"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder:text-zinc-800"
                value={searchParams.location}
                onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-3 flex flex-col space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Search Engine</label>
              <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                <button 
                  type="button"
                  onClick={() => setSearchParams(prev => ({ ...prev, sourceType: 'maps' }))}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${searchParams.sourceType === 'maps' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-400'}`}
                >
                  Maps
                </button>
                <button 
                  type="button"
                  onClick={() => setSearchParams(prev => ({ ...prev, sourceType: 'web' }))}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${searchParams.sourceType === 'web' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-400'}`}
                >
                  Web
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <button 
                type="submit"
                disabled={status === 'searching'}
                className="w-full h-[46px] bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-600/20"
              >
                {status === 'searching' ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </div>
                ) : (
                  'Generate Leads'
                )}
              </button>
            </div>
          </form>
          
          {loadingMsg && (
            <div className="mt-4 flex items-center text-[11px] text-indigo-400 font-medium bg-indigo-500/5 w-fit px-3 py-1.5 rounded-full border border-indigo-500/10">
              <div className="flex space-x-1 mr-2">
                <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              {loadingMsg}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-400 text-xs">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-8">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Database Size</span>
              <span className="text-3xl font-bold text-white mono">{leads.length}</span>
            </div>
            <div className="h-12 w-[1px] bg-zinc-800"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Engine Status</span>
              <span className={`text-[11px] font-bold mt-1 px-3 py-1 rounded-md ${
                status === 'searching' ? 'bg-indigo-500/10 text-indigo-400 animate-pulse border border-indigo-500/20' : 
                status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                'bg-zinc-800 text-zinc-500 border border-zinc-700'
              }`}>
                {status === 'idle' ? 'STANDBY' : status.toUpperCase()}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleClear}
            className="text-xs font-bold text-zinc-600 hover:text-red-400 transition-colors flex items-center group py-2 px-4 rounded-lg hover:bg-red-500/5"
          >
            <svg className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Reset Database
          </button>
        </div>

        <LeadTable leads={leads} />
      </main>

      <footer className="py-8 border-t border-zinc-900 bg-zinc-950 text-center">
        <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-medium">
          Professional LeadGen Suite &bull; Google Maps & Search Grounding &bull; v1.2.0
        </p>
      </footer>
    </div>
  );
};

export default App;
