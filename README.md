# NIH Grants MCP — AI Agent Tool for NIH RePORTER Funding Intelligence

*Search grants, analyze institutional funding portfolios, and map research trends using the free NIH RePORTER API — no API key required.*

---

## 1. Quick Start

**Four ways to invoke this MCP:**

### MCP Client (Claude Desktop, Cursor, Windsurf)
```json
{
  "mcpServers": {
    "nih-grants-mcp": {
      "url": "https://red-cars--nih-grants-mcp.apify.actor/mcp"
    }
  }
}
```

### Direct API Call (curl)
```bash
curl -X POST https://red-cars--nih-grants-mcp.apify.actor/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "search_grants", "arguments": {"query": "machine learning", "fiscal_year": 2024}}}'
```

### LangChain
```python
from langchain_mcp_adapters.tools import load_mcp_tools
tools = load_mcp_tools("red-cars--nih-grants-mcp.apify.actor")
```

### AutoGen / CrewAI
```python
from autogen import config
config.list_mcps({"nih-grants-mcp": "https://red-cars--nih-grants-mcp.apify.actor/mcp"})
```

---

## 2. What Data Can You Extract?

| Data Point | Description | Example |
|------------|-------------|---------|
| Active grants | All funded NIH projects | R01, R21, U01 awards |
| Funding amounts | Total cost per grant | $500,000 |
| Principal investigators | PI names and affiliations | "John Smith, MIT" |
| Organizations | Institutions receiving funding | "Massachusetts General Hospital" |
| Publications | Papers linked to grants | PMID, DOI, citation count |
| Funding trends | Year-over-year funding by area | Alzheimer's research +15% |
| Institutional portfolios | Complete funding breakdown | Harvard: 342 grants, $180M |
| Researcher profiles | PI career funding history | Dr. Jane Doe: 8 grants, $4.2M |

---

## 3. Why Use This Tool?

**Built for AI agents doing research intelligence:**

- **No API key needed** — NIH RePORTER is completely free, no registration
- **Structured JSON output** — AI agents can parse results without scraping
- **Cross-sell ready** — Outputs link to related MCPs (academic papers, clinical trials)
- **Institutional analysis** — One call to get complete funding portfolio of any institution
- **Rate-limit friendly** — 1 req/sec recommended, generous limits

**vs. doing it manually:** You'd have to navigate grants.gov, export CSVs, and parse PDFs. This MCP gives AI agents direct programmatic access to the same NIH data that institutions use internally.

---

## 4. Features

- **6 MCP tools** covering grants search, details lookup, citations, and institutional/resercher profiles
- **Full NIH RePORTER v2 API coverage** — projects + publications endpoints
- **Rate limiting handled** — built-in delays to avoid 429 errors
- **Graceful degradation** — if one field is missing, returns what's available
- **Cross-MCP chaining** — grant results include publication links that map to academic-research-mcp
- **Structured JSON outputs** — predictable schema for AI agent consumption
- **Free forever** — NIH funds this as public data infrastructure

---

## 5. Input Parameters

### search_grants

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | No | — | Text search (org, project terms, PI name) |
| `fiscal_year` | integer | No | — | Filter by fiscal year (e.g., 2024) |
| `organization` | string | No | — | Filter by organization name |
| `pi_name` | string | No | — | Filter by principal investigator |
| `department` | string | No | — | Filter by department |
| `funding_mechanism` | string | No | — | Filter by mechanism (R01, R21, U01, etc.) |
| `research_score` | integer | No | — | NIH research activity code |
| `limit` | integer | No | 25 | Max results (max 500) |

### get_grant_details

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `project_number` | string | **Yes** | — | NIH project number (e.g., R01-AG123456) |

### find_grant_citations

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `project_number` | string | **Yes** | — | NIH project number |

### organization_funding_profile

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization` | string | **Yes** | — | Organization name |
| `fiscal_year` | integer | No | — | Single year, or all recent if omitted |

### researcher_profile

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `pi_name` | string | **Yes** | — | Principal investigator full name |

### funding_trends

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `research_area` | string | **Yes** | — | Research area/terms |
| `organization_type` | string | No | — | Org type filter |
| `fiscal_years` | array[int] | No | [2022-2024] | Years to compare |

---

## 6. Use Cases

### Use Case 1: Find AI/ML Research Funding
```json
{
  "name": "search_grants",
  "arguments": {
    "query": "artificial intelligence machine learning",
    "fiscal_year": 2024,
    "limit": 20
  }
}
```
**When to use:** Before starting an AI research project, to understand what's already funded and by whom.

### Use Case 2: Analyze a University's Research Portfolio
```json
{
  "name": "organization_funding_profile",
  "arguments": {
    "organization": "Stanford University",
    "fiscal_year": 2024
  }
}
```
**When to use:** Academic partnerships, competitive analysis, or due diligence on institutional research strength.

### Use Case 3: Build a Researcher Profile for Recruitment
```json
{
  "name": "researcher_profile",
  "arguments": {
    "pi_name": "Susan Chen"
  }
}
```
**When to use:** Recruiting, academic network analysis, or identifying key opinion leaders in a field.

### Use Case 4: Research Trend Analysis for Business Intelligence
```json
{
  "name": "funding_trends",
  "arguments": {
    "research_area": "gene therapy",
    "fiscal_years": [2020, 2021, 2022, 2023, 2024]
  }
}
```
**When to use:** Market research, investment analysis, or identifying growing research areas before they become mainstream.

---

## 7. MCP Tools Reference

### search_grants
- **Purpose:** General grant search across all NIH funded projects
- **When to call:** When you need to find grants matching keywords, orgs, PIs, or time periods
- **AI prompt example:** *"Find all NIH grants in 2024 related to CRISPR gene editing at MIT"*
- **Price:** $0.05

### get_grant_details
- **Purpose:** Get full details for a specific grant by project number
- **When to call:** After finding a grant, when you need the abstract, dates, and total budget
- **AI prompt example:** *"Get details for NIH grant R01-AG012345"*
- **Price:** $0.03

### find_grant_citations
- **Purpose:** Link grants to their research output publications
- **When to call:** When you want to see what papers resulted from a grant
- **AI prompt example:** *"What publications came from grant U01-CA123456?"*
- **Price:** $0.03

### organization_funding_profile
- **Purpose:** Complete funding portrait of any institution
- **When to call:** When evaluating an institution for partnership, investment, or recruitment
- **AI prompt example:** *"What is the NIH funding profile for Johns Hopkins Hospital?"*
- **Price:** $0.08

### researcher_profile
- **Purpose:** Career funding history for a principal investigator
- **When to call:** When assessing researcher expertise or recruiting
- **AI prompt example:** *"Give me the funding profile for Dr. Rachel Kim at UCSF"*
- **Price:** $0.05

### funding_trends
- **Purpose:** Aggregate funding by research area over time
- **When to call:** When doing market research or trend analysis
- **AI prompt example:** *"Show me 5-year funding trends for quantum computing NIH grants"*
- **Price:** $0.08

---

## 8. Output Example

```json
{
  "content": [{
    "type": "text",
    "text": "{\"count\": 3, \"results\": [{\"project_num\": \"R01-AG077123\", \"title\": \"Machine Learning for Early Alzheimer's Detection\", \"pi\": \"Smith, John\", \"organization\": \"Massachusetts General Hospital\", \"funding_mechanism\": \"R01\", \"total_cost\": 650000, \"fiscal_year\": 2024, \"research_area\": \"Neurology\"}]}"
  }]
}
```

**Parsed output structure:**
```json
{
  "count": 3,
  "results": [
    {
      "project_num": "R01-AG077123",
      "title": "Machine Learning for Early Alzheimer's Detection",
      "pi": "Smith, John",
      "organization": "Massachusetts General Hospital",
      "funding_mechanism": "R01",
      "total_cost": 650000,
      "fiscal_year": 2024,
      "research_area": "Neurology"
    }
  ]
}
```

---

## 9. Pricing

All tools use **Pay-Per-Event (PPE)** — you only pay when a tool is called.

| Tool | Price | Notes |
|------|-------|-------|
| `search_grants` | $0.05 | Search with up to 500 results |
| `get_grant_details` | $0.03 | Specific grant lookup |
| `find_grant_citations` | $0.03 | Publication links |
| `organization_funding_profile` | $0.08 | Full institutional analysis |
| `researcher_profile` | $0.05 | PI career analysis |
| `funding_trends` | $0.08 | Multi-year trend analysis |

**Free API:** NIH RePORTER is a free public API — this MCP adds structure, rate limiting, and AI-agent-optimized outputs on top.

---

## 10. How It Works

```
AI Agent                    NIH Grants MCP                  NIH RePORTER API
   |                              |                               |
   |--- search_grants ------------>|--- POST /projects/search --->|
   |                              |                               |
   |<-- JSON results -------------|<-- JSON ----------------------|
   |                              |                               |
   |--- organization_profile ---->|--- POST /projects/search ---->|
   |   (loop for multi-year)      |   (one request per year)      |
   |<-- Aggregated profile -------|<-- Raw results ----------------|
```

**Architecture:**
- Node.js MCP server with `handleRequest` export
- Standby HTTP server for readiness probe on `/health`
- MCP protocol endpoint at `/mcp`
- Parallel API fetching where possible (multi-year trends)
- 120-second timeout per source, graceful degradation

---

## 11. API Endpoints

**MCP endpoint:**
```
https://red-cars--nih-grants-mcp.apify.actor/mcp
```

**Underlying NIH RePORTER API:**
```
POST https://api.reporter.nih.gov/v2/projects/search
POST https://api.reporter.nih.gov/v2/publications/search
```

**No API key required** — NIH RePORTER is a free public database.

---

## 12. Related Actors (Cross-Sell)

| MCP | How It Chains |
|-----|--------------|
| **academic-research-mcp** | `search_papers` to find related publications for any grant's research area |
| **university-research-mcp** | `institution_report` for deeper institutional benchmarking |
| **healthcare-compliance-mcp** | `search_clinical_trials` to link grants to active trials |
| **tech-scouting-report-mcp** | `tech_scout_funding_landscape` for startup funding analysis |

**Example chain:**
```
funding_trends (gene therapy)
  → identifies top institutions
  → organization_funding_profile (institution)
  → find_grant_citations (grant)
  → search_papers (academic-research-mcp) to see publications
```

---

## 13. Troubleshooting

| Issue | Solution |
|-------|----------|
| Empty results for org name | Try variations ("Massachusetts General Hospital" vs "MGH"). NIH uses official org names. |
| 429 rate limit error | Built-in delays handle this. If persistent, wait 60s and retry. |
| Grant not found | NIH project numbers are case-sensitive (R01, not r01). Try the search tool first. |
| Publications count = 0 | Not all grants have linked publications. Check with `find_grant_citations`. |

---

## 14. Feedback

Found a bug or want a new feature?
- GitHub Issues: https://github.com/red-cars-io/nih-grants-mcp/issues
- Apify Actor: https://apify.com/red-cars/nih-grants-mcp

---

## 15. License

MIT License — see LICENSE file for details.

---

## 16. Credits

- **NIH RePORTER** — Public database maintained by National Institutes of Health
- **Apify** — Platform for running MCP servers at scale
- Built by [red-cars-io](https://github.com/red-cars-io)

---

## 17. Changelog

### v1.0 (2026-04-21)
- Initial release
- 6 MCP tools: search_grants, get_grant_details, find_grant_citations, organization_funding_profile, researcher_profile, funding_trends
- Full NIH RePORTER v2 API integration
- Cross-sell links to academic-research-mcp, university-research-mcp, healthcare-compliance-mcp, tech-scouting-report-mcp

---

## 18. SEO & LLM Optimization

**AI agent discoverability keywords (included naturally throughout):**
- "MCP server", "AI agent tool", "LLM", "Claude", "Cursor", "Windsurf"
- "NIH grants", "funding search", "research intelligence", "grant database"
- "no API key needed", "free NIH data", "RePORTER"
- "LangChain MCP", "AutoGen MCP", "CrewAI MCP", "MCP integration"
- Cross-MCP chain references to related tools in outputs

**GitHub topics:** `mcp`, `mcp-server`, `apify`, `ai-tools`, `nih`, `grants`, `research-intelligence`, `funding-analysis`
