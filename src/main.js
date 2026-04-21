import http from 'http';
import { URL } from 'url';

// NIH RePORTER API base
const NIH_API_BASE = 'https://api.reporter.nih.gov/v2';

// MCP manifest
const MANIFEST = {
  name: 'nih_grants_mcp',
  version: '1.0',
  description: 'NIH RePORTER API MCP server — search grants, funding trends, and institutional analysis for AI agents',
  tools: [
    {
      name: 'search_grants',
      description: 'Search NIH grants and funding opportunities. Use when you need to find active or past grants matching keywords, organizations, or PIs.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Text search query (org name, project terms, PI name)', title: 'Query' },
          fiscal_year: { type: 'integer', description: 'Filter by fiscal year (e.g., 2024)', title: 'Fiscal Year' },
          organization: { type: 'string', description: 'Filter by organization name (e.g., "Harvard University")', title: 'Organization' },
          pi_name: { type: 'string', description: 'Filter by principal investigator name', title: 'PI Name' },
          department: { type: 'string', description: 'Filter by department within organization', title: 'Department' },
          funding_mechanism: { type: 'string', description: 'Filter by funding mechanism (e.g., "R01", "R21", "U01")', title: 'Funding Mechanism' },
          research_score: { type: 'integer', description: 'Filter by NIH research activity code', title: 'Research Score' },
          limit: { type: 'integer', description: 'Max results (default 25, max 500)', default: 25, title: 'Limit' }
        },
        required: []
      },
      priceUsd: 0.05
    },
    {
      name: 'get_grant_details',
      description: 'Get detailed information about a specific NIH grant by its project number. Use when you have a specific project number and need full details.',
      inputSchema: {
        type: 'object',
        properties: {
          project_number: { type: 'string', description: 'NIH project number (e.g., "R01-AG123456")', title: 'Project Number' }
        },
        required: ['project_number']
      },
      priceUsd: 0.03
    },
    {
      name: 'find_grant_citations',
      description: 'Find publications associated with a specific NIH grant. Use to link grants to research outputs.',
      inputSchema: {
        type: 'object',
        properties: {
          project_number: { type: 'string', description: 'NIH project number (e.g., "R01-AG123456")', title: 'Project Number' }
        },
        required: ['project_number']
      },
      priceUsd: 0.03
    },
    {
      name: 'organization_funding_profile',
      description: 'Get a funding profile for an institution — total funding, project count, research areas, and trends. Use when analyzing an institution research portfolio.',
      inputSchema: {
        type: 'object',
        properties: {
          organization: { type: 'string', description: 'Organization name (e.g., "Massachusetts General Hospital")', title: 'Organization' },
          fiscal_year: { type: 'integer', description: 'Filter by fiscal year (default: most recent)', title: 'Fiscal Year' }
        },
        required: ['organization']
      },
      priceUsd: 0.08
    },
    {
      name: 'researcher_profile',
      description: 'Get a research profile for a principal investigator — total funding, active grants, publications count, and research areas. Use when analyzing a researcher career.',
      inputSchema: {
        type: 'object',
        properties: {
          pi_name: { type: 'string', description: 'Principal investigator full name (e.g., "John Smith")', title: 'PI Name' }
        },
        required: ['pi_name']
      },
      priceUsd: 0.05
    },
    {
      name: 'funding_trends',
      description: 'Get aggregate funding trends by research area or organization type. Use for market research, competitive analysis, or research landscape mapping.',
      inputSchema: {
        type: 'object',
        properties: {
          research_area: { type: 'string', description: 'Research area/terms to analyze (e.g., "machine learning", "Alzheimer")', title: 'Research Area' },
          organization_type: { type: 'string', description: 'Filter by org type (e.g., "U.S. Medical School", "Research Institute")', title: 'Organization Type' },
          fiscal_years: { type: 'array', items: { type: 'integer' }, description: 'Fiscal years to compare (e.g., [2022, 2023, 2024])', title: 'Fiscal Years' }
        },
        required: ['research_area']
      },
      priceUsd: 0.08
    }
  ]
};

// ---- HTTP Server for Standby Mode ----
let server;
const PORT = process.env.PORT || 8080;

function startHttpServer() {
  server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200);
      res.end('OK');
      return;
    }
    if (req.method === 'GET' && req.url === '/mcp') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(MANIFEST));
      return;
    }
    res.writeHead(404);
    res.end('Not found');
  });
  server.listen(PORT, () => console.log(`NIH Grants MCP HTTP server listening on ${PORT}`));
  server.on('error', (err) => { console.error('Server error:', err); process.exit(1); });
}

// ---- MCP Request Handler ----
async function handleRequest(obj) {
  const { method, params = {} } = obj;
  switch (method) {
    case 'tools/list': {
      return { tools: MANIFEST.tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) };
    }
    case 'tools/call': {
      const { name, arguments: args = {} } = params;
      switch (name) {
        case 'search_grants': return searchGrants(args);
        case 'get_grant_details': return getGrantDetails(args);
        case 'find_grant_citations': return findGrantCitations(args);
        case 'organization_funding_profile': return organizationFundingProfile(args);
        case 'researcher_profile': return researcherProfile(args);
        case 'funding_trends': return fundingTrends(args);
        default: throw new Error(`Unknown tool: ${name}`);
      }
    }
    default: throw new Error(`Unknown method: ${method}`);
  }
}

// ---- API Calls ----
async function nihRequest(endpoint, body, timeout = 120000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${NIH_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`NIH API error: ${res.status} ${res.statusText}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function searchGrants(args) {
  const { query, fiscal_year, organization, pi_name, department, funding_mechanism, research_score, limit = 25 } = args;
  const criteria = {};
  if (query) criteria.abstract_text = [query];
  if (fiscal_year) criteria.fiscal_years = [fiscal_year];
  if (organization) criteria.organization_names = [{ organization_name: organization }];
  if (pi_name) criteria.pi_names = [{ pi_name }];
  if (department) criteria.department_name = department;
  if (funding_mechanism) criteria.funding_mechanisms = [funding_mechanism];
  if (research_score) criteria.research_activity_codes = [String(research_score)];
  const payload = {
    criteria,
    offset: 0,
    limit: Math.min(limit, 500),
    sort_field: 'project_start_date',
    sort_order: 'desc'
  };
  const data = await nihRequest('/projects/search', payload);
  const results = (data.results || []).map(p => ({
    project_num: p.project_num,
    title: p.project_title,
    pi: p.pi_investigators?.[0]?.pi_name || 'N/A',
    organization: p.organization_name,
    funding_mechanism: p.funding_mechanism,
    total_cost: p.total_cost,
    fiscal_year: p.fiscal_year,
    research_area: p.research_classifications?.[0] || 'N/A'
  }));
  return { content: [{ type: 'text', text: JSON.stringify({ count: results.length, results }) }] };
}

async function getGrantDetails(args) {
  const { project_number } = args;
  const data = await nihRequest('/projects/search', {
    criteria: { project_numbers: [project_number] },
    offset: 0,
    limit: 1,
    include_fields: ['project_num', 'project_title', 'pi_investigators', 'organization_name', 'funding_mechanism', 'total_cost', 'total_cost_sub_award', 'award_notice_date', 'project_start_date', 'project_end_date', 'fulfillment_date', 'department_name', 'research_classifications', 'abstract_text', 'publications', 'core_project_num']
  });
  const p = data.results?.[0];
  if (!p) return { content: [{ type: 'text', text: JSON.stringify({ error: 'Grant not found' }) }] };
  return { content: [{ type: 'text', text: JSON.stringify({
    project_num: p.project_num,
    core_project_num: p.core_project_num,
    title: p.project_title,
    pi: p.pi_investigators?.[0]?.pi_name || 'N/A',
    organization: p.organization_name,
    department: p.department_name,
    funding_mechanism: p.funding_mechanism,
    total_cost: p.total_cost,
    total_cost_sub_award: p.total_cost_sub_award,
    award_notice_date: p.award_notice_date,
    project_start_date: p.project_start_date,
    project_end_date: p.project_end_date,
    research_areas: p.research_classifications || [],
    abstract: p.abstract_text,
    publications_count: p.publications?.length || 0
  }) }] };
}

async function findGrantCitations(args) {
  const { project_number } = args;
  const data = await nihRequest('/publications/search', {
    criteria: { core_project_nums: [project_number] },
    offset: 0,
    limit: 100,
    include_fields: ['pmid', 'doi', 'pub_title', 'authors', 'journal_title', 'pub_year', 'pub_date', 'citation_count']
  });
  const pubs = (data.results || []).map(p => ({
    pmid: p.pmid,
    doi: p.doi,
    title: p.pub_title,
    authors: p.authors?.slice(0, 5).join('; ') || 'N/A',
    journal: p.journal_title,
    year: p.pub_year,
    citations: p.citation_count
  }));
  return { content: [{ type: 'text', text: JSON.stringify({ count: pubs.length, publications: pubs }) }] };
}

async function organizationFundingProfile(args) {
  const { organization, fiscal_year } = args;
  const years = fiscal_year ? [fiscal_year] : [2024, 2023, 2022];
  const allResults = [];
  for (const year of years) {
    const data = await nihRequest('/projects/search', {
      criteria: { organization_names: [{ organization_name: organization }], fiscal_years: [year] },
      offset: 0,
      limit: 500,
      include_fields: ['project_num', 'project_title', 'pi_investigators', 'funding_mechanism', 'total_cost', 'research_classifications']
    });
    allResults.push(...(data.results || []));
  }
  const totalFunding = allResults.reduce((sum, p) => sum + (p.total_cost || 0), 0);
  const mechanisms = {};
  const areas = {};
  allResults.forEach(p => {
    mechanisms[p.funding_mechanism] = (mechanisms[p.funding_mechanism] || 0) + 1;
    (p.research_classifications || []).forEach(a => { areas[a] = (areas[a] || 0) + 1; });
  });
  const topMechanisms = Object.entries(mechanisms).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topAreas = Object.entries(areas).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return { content: [{ type: 'text', text: JSON.stringify({
    organization,
    years_analyzed: years,
    total_grants: allResults.length,
    total_funding: totalFunding,
    top_funding_mechanisms: topMechanisms,
    top_research_areas: topAreas,
    cross_sell: 'academic-research-mcp:search_papers (find related papers), healthcare-compliance-mcp:search_clinical_trials (link to trials)'
  }) }] };
}

async function researcherProfile(args) {
  const { pi_name } = args;
  const data = await nihRequest('/projects/search', {
    criteria: { pi_names: [{ pi_name }] },
    offset: 0,
    limit: 500,
    include_fields: ['project_num', 'project_title', 'fiscal_year', 'funding_mechanism', 'total_cost', 'organization_name', 'research_classifications']
  });
  const grants = data.results || [];
  const totalFunding = grants.reduce((sum, p) => sum + (p.total_cost || 0), 0);
  const orgs = [...new Set(grants.map(p => p.organization_name))];
  const mechanisms = {};
  grants.forEach(p => { mechanisms[p.funding_mechanism] = (mechanisms[p.funding_mechanism] || 0) + 1; });
  const topMechanisms = Object.entries(mechanisms).sort((a, b) => b[1] - a[1]);
  return { content: [{ type: 'text', text: JSON.stringify({
    pi_name,
    total_active_grants: grants.length,
    total_funding: totalFunding,
    organizations: orgs,
    top_funding_mechanisms: topMechanisms,
    years: [...new Set(grants.map(p => p.fiscal_year))].sort(),
    cross_sell: 'academic-research-mcp:find_citations (link grants to publications)'
  }) }] };
}

async function fundingTrends(args) {
  const { research_area, organization_type, fiscal_years } = args;
  const years = fiscal_years || [2024, 2023, 2022, 2021, 2020];
  const trends = {};
  for (const year of years) {
    const criteria = { fiscal_years: [year] };
    if (research_area) criteria.criteria = { term: research_area };
    if (organization_type) criteria.organization_types = [organization_type];
    const body = {
      criteria: criteria,
      offset: 0,
      limit: 500
    };
    const data = await nihRequest('/projects/search', body);
    const total = (data.results || []).reduce((sum, p) => sum + (p.total_cost || 0), 0);
    trends[year] = { grant_count: data.results?.length || 0, total_funding: total };
  }
  return { content: [{ type: 'text', text: JSON.stringify({
    research_area,
    organization_type: organization_type || 'All',
    trends,
    cross_sell: 'university-research-mcp:benchmark_institutions (compare institutions)'
  }) }] };
}

export { handleRequest, startHttpServer };
