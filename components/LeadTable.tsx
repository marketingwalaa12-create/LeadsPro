
import React from 'react';
import { Lead } from '../types';

interface LeadTableProps {
  leads: Lead[];
}

const LeadTable: React.FC<LeadTableProps> = ({ leads }) => {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-zinc-400 font-medium">No leads extracted yet.</p>
        <p className="text-zinc-500 text-sm mt-1">Enter search criteria above to start generating leads.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
      <table className="w-full text-left border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-zinc-800/50 border-b border-zinc-800">
            <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Business Info</th>
            <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact Details</th>
            <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Address & Source</th>
            <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Citations</th>
            <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Rating</th>
            <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-zinc-800/30 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-zinc-100 font-bold text-sm group-hover:text-indigo-400 transition-colors">
                    {lead.name}
                  </span>
                  {lead.website && lead.website !== '#' ? (
                    <a 
                      href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-500 text-xs hover:underline truncate max-w-[180px]"
                    >
                      {lead.website}
                    </a>
                  ) : (
                    <span className="text-zinc-600 text-xs">No website</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center text-xs text-zinc-300">
                    <svg className="w-3 h-3 mr-2 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {lead.phone}
                  </div>
                  <div className="flex items-center text-xs text-zinc-300">
                    <svg className="w-3 h-3 mr-2 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate max-w-[150px]">{lead.email}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col max-w-[250px]">
                  <span className="text-zinc-400 text-xs italic mb-2 line-clamp-2">{lead.address}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${lead.source === 'Google Maps' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                    {lead.source}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  {lead.sources && lead.sources.length > 0 ? (
                    lead.sources.slice(0, 2).map((s, i) => (
                      <a 
                        key={i} 
                        href={s.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[10px] text-zinc-500 hover:text-indigo-400 flex items-center truncate max-w-[150px]"
                      >
                        <svg className="w-2.5 h-2.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                        {s.title}
                      </a>
                    ))
                  ) : (
                    <span className="text-[10px] text-zinc-700 font-mono italic">No verification links</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1 text-xs">★</span>
                  <span className="text-zinc-300 text-xs font-medium">{lead.rating || '0.0'}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => window.open(lead.website !== '#' ? lead.website : `https://www.google.com/search?q=${encodeURIComponent(lead.name)}`, '_blank')}
                  className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                  title="Search Online"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
