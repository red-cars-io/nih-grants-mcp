# NIH Grants MCP Server

> **[View on Apify](https://apify.com/red.cars/nih-grants-mcp)** | **[Use on Apify Store](https://apify.com/red.cars/nih-grants-mcp)**

AI agents for NIH grant research — access NIH RePORTER data on grants, publications, organization funding profiles, researcher careers, and funding trends.

---

## 1. Purpose Statement

NIH Grants MCP is an MCP (Model Context Protocol) server that gives AI agents access to NIH RePORTER data. AI agents performing academic research, grant due diligence, institutional funding analysis, or science policy research can query real-time NIH grant data without requiring API keys or manual database navigation.

**Built for:** AI agents doing grant research, academic due diligence, institutional funding analysis, science policy research, and healthcare AI workflows.

---

## 2. Quick Start

Add to your MCP client:

```json
{
  "mcpServers": {
    "nih-grants-mcp": {
      "url": "https://red-cars--nih-grants-mcp.apify.actor/mcp"
    }
  }
}
```

AI agents can now search NIH grants, get grant details, find publications, analyze organization funding profiles, research PI careers, and track funding trends.

---

## 3. When to Call This MCP

Use NIH Grants MCP when you need to:

- **Search NIH grants** — Find grants by topic, organization, PI, or fiscal year
- **Get grant details** — Retrieve detailed information for a specific grant
- **Find grant citations** — Get publications linked to a grant
- **Analyze organization funding** — See total funding for an institution
- **Research PI careers** — Get career funding history for a principal investigator
- **Track funding trends** — Aggregate funding statistics by research area
- **Grant due diligence** — Research funding history for academic or investment decisions
- **Science policy research** — Analyze NIH funding patterns

---

## 4. What NIH Grants Data Can You Access?

| Data Type | Source | Example |
|-----------|--------|---------|
| Grants | NIH RePORTER | Project title, PI, organization, total cost |
| Grant Details | NIH RePORTER | Full grant information, dates, budgets |
| Publications | NIH RePORTER Publications | Articles linked to grants via PMIDs |
| Organization Profiles | NIH RePORTER | Institution funding totals, top funded areas |
| Researcher Profiles | NIH RePORTER | PI career funding, yearly breakdown |
| Funding Trends | NIH RePORTER | Aggregate stats by research area |

---

## 5. Why Use NIH Grants MCP?

**The problem:** NIH grant research — finding funding opportunities, analyzing institution profiles, tracking PI careers — requires searching multiple government databases. For academic due diligence, science policy research, and healthcare AI agents, this data is essential for grant discovery, institutional analysis, and research intelligence. Manual research takes hours across disconnected NIH systems.

**The solution:** AI agents use NIH Grants MCP to get instant, structured NIH grant intelligence — the NIH data layer for grant research and academic intelligence workflows.

### Key benefits:

- **Grant search** — Search NIH grants by topic, organization, PI, or fiscal year
- **Grant details** — Get complete information for specific grants
- **Publication links** — Find all publications citing a specific grant
- **Organization profiles** — Analyze institution funding totals and top funded areas
- **Researcher profiles** — Track PI career funding history
- **Funding trends** — Aggregate funding statistics by research area
- **No API key required** — Uses free NIH RePORTER API, works immediately
- **Parallel data fetching** — Fast responses for time-sensitive research

---

## 6. Features

**Comprehensive NIH Coverage**
Access all major NIH RePORTER endpoints: grants, publications, organization profiles, researcher profiles, and funding trends.

**Academic Research Support**
Search grants by topic, organization, PI, or fiscal year for literature review, meta-analysis, and research planning.

**Institutional Analysis**
Analyze institution funding totals, top funded research areas, and funding trends for competitive intelligence.

**Researcher Career Tracking**
Track PI career funding history, active grants, and yearly funding breakdowns for academic due diligence.

**Funding Trend Analysis**
Aggregate funding statistics by research area, organization type, or geography for science policy research.

---

## 7. How It Compares to Alternatives

| Aspect | Our MCP | NIH RePORTER.gov | GuideStar |
|--------|---------|------------------|-----------|
| Price | $0.03-$0.08/call | Free (manual) | Subscription required |
| API access | MCP (AI-native) | Web only | REST (expensive) |
| Tool coverage | 6 tools (grants, citations, org, PI, trends) | Limited search | Limited data |
| Data source | NIH RePORTER API (free) | Manual search | Aggregated |
| AI agent integration | Native MCP protocol | No MCP support | No MCP support |
| No API key | Yes | Yes | No |
| Publication links | Yes | No | No |
| Funding trends | Yes | Limited | No |

**Why choose our MCP:**
- MCP protocol is designed for AI agent integration — call grant tools with natural language
- Free NIH RePORTER API data source — no API key, no registration, no approval required
- GuideStar costs hundreds/month — our MCP is fractions of a cent per call
- NIH RePORTER.gov has no MCP support — our MCP works natively with Claude, Cursor, and other AI clients
- Publication link tracking from NIH data — find all research outputs from a grant

**Competitor APIs:**
- NIH RePORTER.gov: https://reporter.nih.gov/ (free, but manual search)
- GuideStar: https://www.guidestar.org/ (subscription-based)
- Foundation Directory: https://foundationcenter.org/ (expensive subscription)

---

## 8. Use Cases for NIH Grants

### Grant Discovery
*Persona: Academic researcher using AI to find funding opportunities*

```
AI agent: "Find NIH grants on CRISPR gene editing at MIT in the last 3 years"
MCP call: search_grants({ query: "CRISPR gene editing", organization: "MIT", fiscal_year: 2024, limit: 10 })
Returns: project_num, project_title, pi_name, organization, total_cost, funding_mechanism
```

### Grant Due Diligence
*Persona: Biotech analyst researching academic collaborations*

```
AI agent: "Get the detailed funding information for grant 1R01CA123456-01"
MCP call: get_grant_details({ project_number: "1R01CA123456-01" })
Returns: full grant details including budget, dates, agency, program reference
```

### Publication Research
*Persona: Literature researcher finding publications from a grant*

```
AI agent: "Find all publications from grant 5R01GM123456-02"
MCP call: find_grant_citations({ project_number: "5R01GM123456-02", limit: 20 })
Returns: pmid, article_title, authors, journal_title, publication_date, abstract
```

### Institutional Funding Analysis
*Persona: Competitive intelligence analyst comparing universities*

```
AI agent: "Compare total NIH funding between Harvard and Stanford in 2024"
MCP call: organization_funding_profile({ organization: "Harvard University", fiscal_year: 2024 })
Returns: total_funding, total_grants, top_funding_areas, grants list
```

### PI Career Research
*Persona: Academic recruiter evaluating a candidate's research funding*

```
AI agent: "What is Dr. Jane Smith's NIH funding history over her career?"
MCP call: researcher_profile({ pi_name: "Jane Smith", limit: 50 })
Returns: total_career_funding, total_grants, active_grants, yearly_funding, grants list
```

### Funding Trend Analysis
*Persona: Science policy researcher analyzing NIH priorities*

```
AI agent: "What are the top funded research areas in neuroscience for 2024?"
MCP call: funding_trends({ research_area: "neuroscience", fiscal_year: 2024 })
Returns: total_funding, total_grants, average_grant_size, top_organizations, top_funding_mechanisms
```

---

## 9. How to Connect NIH Grants MCP Server to Your AI Client

### Step 1: Get your Apify API token (optional)

Sign up at [apify.com](https://apify.com/red.cars/nih-grants-mcp) and copy your API token from the console. The MCP works without an API token for tool calls, but Apify authentication may be required by some MCP clients.

### Step 2: Add the MCP server to your client

**Claude Desktop:**
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "nih-grants-mcp": {
      "url": "https://red-cars--nih-grants-mcp.apify.actor/mcp"
    }
  }
}
```

**Cursor/Windsurf:**
Add to MCP settings:
```json
{
  "mcpServers": {
    "nih-grants-mcp": {
      "url": "https://red-cars--nih-grants-mcp.apify.actor/mcp"
    }
  }
}
```

### Step 3: Start querying

```
AI agent: "Find recent NIH grants on AI in healthcare at Johns Hopkins"
```

### Step 4: Retrieve results

The MCP returns structured JSON with grant data, publications, or funding analytics.

---

## 10. MCP Tools

| Tool | Price | Description |
|------|-------|-------------|
| search_grants | $0.05 | Search NIH grants by query, organization, PI, or fiscal year |
| get_grant_details | $0.03 | Get detailed information for a specific grant by project number |
| find_grant_citations | $0.03 | Find publications linked to a specific NIH grant |
| organization_funding_profile | $0.08 | Get aggregate funding totals for an institution |
| researcher_profile | $0.05 | Get career funding history for a principal investigator |
| funding_trends | $0.08 | Get aggregate funding statistics by research area |

---

## 11. Tool Parameters

### search_grants

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | No | Search query (e.g., 'cancer', 'Alzheimer', 'COVID-19') |
| organization | string | No | Organization/institution name |
| pi_name | string | No | Principal investigator name |
| fiscal_year | integer | No | Fiscal year (e.g., 2024) |
| limit | integer | No | Maximum results (default: 10) |

**When to call:** Persona: Academic researcher or competitive intelligence analyst. Scenario: "I need to find recent NIH grants on a specific research topic."

---

### get_grant_details

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| project_number | string | Yes | NIH project number (e.g., '1R01CA123456-01') |

**When to call:** Persona: Grant analyst or due diligence researcher. Scenario: "Get the complete funding details for a specific grant."

---

### find_grant_citations

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| project_number | string | Yes | NIH project number (e.g., '1R01CA123456-01') |
| limit | integer | No | Maximum results (default: 10) |

**When to call:** Persona: Literature researcher or academic analyst. Scenario: "Find all publications resulting from a specific grant."

---

### organization_funding_profile

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| organization | string | Yes | Organization/institution name (e.g., 'Harvard University') |
| fiscal_year | integer | No | Fiscal year (e.g., 2024) |
| limit | integer | No | Maximum results (default: 10) |

**When to call:** Persona: Competitive intelligence analyst or institutional researcher. Scenario: "Analyze total NIH funding for a university."

---

### researcher_profile

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pi_name | string | Yes | Principal investigator name (e.g., 'John Smith') |
| limit | integer | No | Maximum results (default: 10) |

**When to call:** Persona: Academic recruiter or career analyst. Scenario: "Evaluate a researcher's NIH funding history."

---

### funding_trends

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| research_area | string | No | Research area/category (e.g., 'cancer', 'neuroscience', 'immunology') |
| fiscal_year | integer | No | Fiscal year (e.g., 2024) |
| limit | integer | No | Maximum results (default: 10) |

**When to call:** Persona: Science policy researcher or funding analyst. Scenario: "Analyze NIH funding trends by research area."

---

## 12. Connection Examples

### cURL

```bash
curl -X POST "https://red-cars--nih-grants-mcp.apify.actor/mcp" \
  -H "Authorization: Bearer YOUR_APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "search_grants",
    "params": { "query": "cancer", "limit": 5 }
  }'
```

### Node.js

```javascript
const response = await fetch('https://red-cars--nih-grants-mcp.apify.actor/mcp', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_APIFY_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tool: 'search_grants',
    params: { query: 'cancer', limit: 5 }
  })
});
const data = await response.json();
console.log(data.result.grants[0].project_title);
```

---

## 13. Output Example

```json
{
  "status": "success",
  "result": {
    "query": { "query": "cancer", "limit": 5 },
    "total_grants": 125,
    "grants": [
      {
        "project_num": "1R01CA123456-01",
        "project_title": "Molecular Mechanisms of Cancer Therapy",
        "pi_name": "John Smith",
        "pi_email": "jsmith@university.edu",
        "organization": "Stanford University",
        "total_cost": 500000,
        "direct_cost": 350000,
        "agency_code": "CA",
        "funding_mechanism": "R01",
        "start_date": "2024-04-01",
        "end_date": "2029-03-31"
      }
    ],
    "source": "NIH RePORTER"
  }
}
```

---

## 14. Output Fields

| Field | Description |
|-------|-------------|
| query | The original search parameters |
| total_grants/total_citations | Total matching records |
| grants/citations/grants | Array of matching records |
| source | Data source (NIH RePORTER) |
| project_num | NIH project number (e.g., 1R01CA123456-01) |
| total_cost | Total cost in USD |
| funding_mechanism | Activity code (e.g., R01, R21, U01) |
| pmid | PubMed ID for publications |

---

## 15. How Much Does It Cost to Run NIH Grants MCP?

**PPE (Pay-Per-Event) pricing — $0.03 to $0.08 per tool call.**

| Tool | Price |
|------|-------|
| search_grants | $0.05 |
| get_grant_details | $0.03 |
| find_grant_citations | $0.03 |
| organization_funding_profile | $0.08 |
| researcher_profile | $0.05 |
| funding_trends | $0.08 |

No subscription. No monthly fee. Pay only when AI agents use the tools.

**NIH RePORTER API is free** — we charge for the MCP infrastructure and AI agent integration, not the underlying data.

---

## 16. How NIH Grants MCP Works

### Phase 1: Request parsing
AI agent sends tool call via MCP protocol. Server parses tool name and parameters.

### Phase 2: NIH RePORTER API query
For each tool, the server constructs the appropriate NIH API query:
- Grants: POST /v2/projects/search with criteria
- Publications: POST /v2/publications/search with project_nums
- Organization profiles: Search with organization filter
- Researcher profiles: Search with principal_awardees filter
- Funding trends: Search with text_search or fiscal_year

### Phase 3: Response formatting
All results returned as structured JSON with normalized field names and source attribution.

### Phase 4: Pricing
PPE charges applied via Apify Actor.charge() for cost tracking.

---

## 17. Tips for Best Results

1. **Use specific project numbers** — More specific queries return better results than generic search

2. **Include organization names when known** — Searching both topic and organization improves precision

3. **Filter by fiscal year for trending** — Use fiscal_year to track funding over specific time periods

4. **Use researcher_profile for PI evaluation** — Get complete career funding history for academic due diligence

5. **Use funding_trends for policy research** — Aggregate statistics for science policy analysis

6. **Publication links require valid project numbers** — find_grant_citations needs a valid NIH project number

---

## 18. Combine with Other Apify Actors

**For comprehensive academic and research intelligence:**

- **healthcare-compliance-mcp** — Medical device compliance data (device ↔ drug overlap)
- **academic-research-mcp** — Academic paper search and citations
- **drug-intelligence-mcp** — Pharmaceutical research (drug ↔ grant overlap)

**Research chain:**
```
NIH Grants MCP → healthcare-compliance-mcp → academic-research-mcp
```
AI agents researching a grant can: (1) find funding opportunities, (2) verify medical device interactions, (3) find academic literature on clinical trials.

**Note:** NIH Grants MCP provides NIH funding data (grants, publications, funding trends). For academic research, always verify with primary sources. No API key required — AI agents can call these tools directly.

---

## Comparison

For a detailed comparison with NIH RePORTER and other alternatives, see [COMPARISON.md](COMPARISON.md).

---

## SEO Keywords

NIH grants MCP, NIH RePORTER API, grant search, academic funding, researcher profile, organization funding, funding trends, science policy, AI agent NIH, MCP server, LLM grant research, Claude NIH, Cursor academic, research funding AI, institutional analysis, PI career funding, grant due diligence, healthcare AI, AI agent research, academic intelligence, [Comparison: vs NIH RePORTER](COMPARISON.md)

---

## License

Apache 2.0
