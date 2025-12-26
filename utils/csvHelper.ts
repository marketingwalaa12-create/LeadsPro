
import { Lead } from "../types";

export const downloadLeadsAsCSV = (leads: Lead[]) => {
  if (leads.length === 0) return;

  const headers = [
    "Business Name",
    "Phone Number",
    "Email",
    "Website",
    "Address",
    "Rating",
    "Source",
    "Keyword",
    "Location"
  ];

  const rows = leads.map(lead => [
    `"${lead.name.replace(/"/g, '""')}"`,
    `"${(lead.phone || '').replace(/"/g, '""')}"`,
    `"${(lead.email || '').replace(/"/g, '""')}"`,
    `"${(lead.website || '').replace(/"/g, '""')}"`,
    `"${(lead.address || '').replace(/"/g, '""')}"`,
    lead.rating || 0,
    lead.source,
    `"${lead.searchKeyword.replace(/"/g, '""')}"`,
    `"${lead.searchLocation.replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `leads_export_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
