# NIH Grants MCP

NIH RePORTER grant intelligence for AI agents. Access NIH grants, publications, organization funding profiles, researcher careers, and funding trends via the NIH RePORTER API. No API key required.

## What We're Building

An AI agent that can:
1. Search NIH grants by topic, organization, PI, or fiscal year
2. Get detailed information for specific grants
3. Find publications linked to specific NIH grants
4. Analyze organization funding totals and top funded areas
5. Research PI career funding history
6. Track aggregate funding trends by research area

## Prerequisites

- Node.js 18+
- An Apify API token ([free account works](https://console.apify.com/settings/integrations))
- An AI agent framework: LangChain, AutoGen, or CrewAI

## The MCPs We're Using

| MCP | Purpose | Cost | Endpoint |
|-----|---------|------|----------|
| `nih-grants-mcp` | NIH grants, publications, org profiles, PI profiles, funding trends | $0.03-0.08/call | `red-cars--nih-grants-mcp.apify.actor` |
| `healthcare-compliance-mcp` | FDA device approvals, MAUDE, 510(k), ClinicalTrials | $0.03-0.15/call | `red-cars--healthcare-compliance-mcp.apify.actor` |

**Note:** `nih-grants-mcp` and `healthcare-compliance-mcp` are complementary — one covers NIH funding, the other covers FDA regulatory data. Chain them together for full research intelligence.

## Step 1: Add the MCP Servers

### MCP Server Configuration

```json
{
  "mcpServers": {
    "nih-grants": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-apify", "red-cars--nih-grants-mcp"],
      "env": {
        "APIFY_API_TOKEN": "${APIFY_API_TOKEN}"
      }
    },
    "healthcare-compliance": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-apify", "red-cars--healthcare-compliance-mcp"],
      "env": {
        "APIFY_API_TOKEN": "${APIFY_API_TOKEN}"
      }
    }
  }
}
```

### LangChain Configuration

```javascript
import { ApifyAdapter } from "@langchain/community/tools/apify";
import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

const tools = [
  new ApifyAdapter({
    token: process.env.APIFY_API_TOKEN,
    actorId: "red-cars--nih-grants-mcp",
  }),
  new ApifyAdapter({
    token: process.env.APIFY_API_TOKEN,
    actorId: "red-cars--healthcare-compliance-mcp",
  }),
];

const agent = await initializeAgentExecutorWithOptions(tools, new ChatOpenAI({
  model: "gpt-4",
  temperature: 0
}), { agentType: "openai-functions" });
```

### AutoGen Configuration

```javascript
import { MCPAgent } from "autogen-mcp";

const nihGrantsAgent = new MCPAgent({
  name: "nih-grants",
  mcpServers: [
    {
      name: "nih-grants",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-apify", "red-cars--nih-grants-mcp"],
    },
    {
      name: "healthcare-compliance",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-apify", "red-cars--healthcare-compliance-mcp"],
    }
  ]
});
```

### CrewAI Configuration

```yaml
# crewai.yaml
tools:
  - name: nih_grants
    type: apify
    actor_id: red-cars--nih-grants-mcp
    api_token: ${APIFY_API_TOKEN}

  - name: healthcare_compliance
    type: apify
    actor_id: red-cars--healthcare-compliance-mcp
    api_token: ${APIFY_API_TOKEN}
```

## Step 2: NIH Grants Queries

### Search NIH Grants

```javascript
const result = await nihGrantsAgent.execute({
  action: "search_grants",
  query: "CRISPR gene editing",
  organization: "MIT",
  fiscal_year: 2024,
  limit: 5
});

console.log(result);
// Returns: grants with project_num, project_title, pi_name, organization, total_cost
```

### Get Grant Details

```javascript
const result = await nihGrantsAgent.execute({
  action: "get_grant_details",
  project_number: "1R01CA123456-01"
});

console.log(result);
// Returns: full grant details including budget, dates, agency, program reference
```

### Find Grant Citations

```javascript
const result = await nihGrantsAgent.execute({
  action: "find_grant_citations",
  project_number: "5R01GM123456-02",
  limit: 10
});

console.log(result);
// Returns: publications with pmid, article_title, authors, journal_title, abstract
```

### Organization Funding Profile

```javascript
const result = await nihGrantsAgent.execute({
  action: "organization_funding_profile",
  organization: "Stanford University",
  fiscal_year: 2024,
  limit: 10
});

console.log(result);
// Returns: total_funding, total_grants, top_funding_areas, grants list
```

### Researcher Profile

```javascript
const result = await nihGrantsAgent.execute({
  action: "researcher_profile",
  pi_name: "Jane Smith",
  limit: 10
});

console.log(result);
// Returns: total_career_funding, total_grants, active_grants, yearly_funding
```

### Funding Trends

```javascript
const result = await nihGrantsAgent.execute({
  action: "funding_trends",
  research_area: "neuroscience",
  fiscal_year: 2024,
  limit: 10
});

console.log(result);
// Returns: total_funding, total_grants, average_grant_size, top_organizations, top_funding_mechanisms
```

## Step 3: Chain NIH Grants + Healthcare Compliance

### Full Example: Academic Research Due Diligence

```javascript
import { ApifyClient } from 'apify';

const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function buildAcademicDueDiligence(researcherName, institution) {
  console.log(`=== Academic Due Diligence: ${researcherName} at ${institution} ===\n`);

  // Step 1: Get researcher profile
  console.log('[1/4] Fetching researcher profile...');
  const researcher = await apify.call('nih-grants-mcp', {
    action: 'researcher_profile',
    pi_name: researcherName,
    limit: 20
  });

  // Step 2: Get organization funding profile
  console.log('[2/4] Analyzing organization funding...');
  const orgProfile = await apify.call('nih-grants-mcp', {
    action: 'organization_funding_profile',
    organization: institution,
    limit: 10
  });

  // Step 3: Get funding trends
  console.log('[3/4] Analyzing funding trends...');
  const trends = await apify.call('nih-grants-mcp', {
    action: 'funding_trends',
    research_area: "cancer",
    fiscal_year: 2024
  });

  // Step 4: Check for related clinical trials
  console.log('[4/4] Checking clinical trials...');
  const clinicalTrials = await apify.call('healthcare-compliance-mcp', {
    action: 'search_clinical_trials',
    condition: researcherName,
    phase: 'Phase 3'
  });

  // Build report
  const report = {
    researcher: {
      name: researcherName,
      totalCareerFunding: researcher.data?.total_career_funding || 0,
      totalGrants: researcher.data?.total_grants || 0,
      activeGrants: researcher.data?.active_grants || 0
    },
    institution: {
      name: institution,
      totalFunding: orgProfile.data?.total_funding || 0,
      totalGrants: orgProfile.data?.total_grants || 0
    },
    trends: {
      totalFunding: trends.data?.total_funding || 0,
      totalGrants: trends.data?.total_grants || 0,
      avgGrantSize: trends.data?.average_grant_size || 0
    },
    clinicalTrials: {
      total: clinicalTrials.data?.total || 0,
      trials: clinicalTrials.data?.trials || []
    }
  };

  console.log('\n=== REPORT SUMMARY ===');
  console.log(`Researcher: ${report.researcher.name}`);
  console.log(`Career Funding: $${report.researcher.totalCareerFunding.toLocaleString()}`);
  console.log(`Total Grants: ${report.researcher.totalGrants}`);
  console.log(`Active Grants: ${report.researcher.activeGrants}`);
  console.log(`Institution Funding: $${report.institution.totalFunding.toLocaleString()}`);
  console.log(`Clinical Trials: ${report.clinicalTrials.total}`);

  return report;
}

buildAcademicDueDiligence('Jane Smith', 'Stanford University').catch(console.error);
```

### Expected Output

```
=== Academic Due Diligence: Jane Smith at Stanford University ===

[1/4] Fetching researcher profile...
[2/4] Analyzing organization funding...
[3/4] Analyzing funding trends...
[4/4] Checking clinical trials...

=== REPORT SUMMARY ===
Researcher: Jane Smith
Career Funding: $12,500,000
Total Grants: 15
Active Grants: 3
Institution Funding: $1,250,000,000
Clinical Trials: 4
```

## MCP Tool Reference

### NIH Grants MCP

**Endpoint:** `red-cars--nih-grants-mcp.apify.actor`

| Tool | Price | Description | Key Parameters |
|------|-------|-------------|----------------|
| `search_grants` | $0.05 | NIH grant search | `query`, `organization`, `pi_name`, `fiscal_year`, `limit` |
| `get_grant_details` | $0.03 | Grant details | `project_number` |
| `find_grant_citations` | $0.03 | Publications from grant | `project_number`, `limit` |
| `organization_funding_profile` | $0.08 | Institution funding | `organization`, `fiscal_year`, `limit` |
| `researcher_profile` | $0.05 | PI career funding | `pi_name`, `limit` |
| `funding_trends` | $0.08 | Funding statistics | `research_area`, `fiscal_year`, `limit` |

### Healthcare Compliance MCP

**Endpoint:** `red-cars--healthcare-compliance-mcp.apify.actor`

| Tool | Price | Description | Key Parameters |
|------|-------|-------------|----------------|
| `search_fda_approvals` | $0.03 | FDA device approvals | `searchTerm`, `deviceState`, `dateFrom` |
| `search_maude_reports` | $0.05 | MAUDE adverse events | `manufacturer`, `deviceName`, `dateFrom` |
| `search_510k` | $0.03 | 510(k) clearances | `searchTerm`, `productCode`, `dateFrom` |
| `search_clinical_trials` | $0.05 | ClinicalTrials.gov | `condition`, `intervention`, `phase` |
| `assess_medical_device_risk` | $0.15 | Risk assessment | `device_name`, `risk_factors` |

## Cost Summary

| MCP | Typical Query | Est. Cost |
|-----|---------------|-----------|
| nih-grants-mcp | Grant search | ~$0.05 |
| nih-grants-mcp | Grant details | ~$0.03 |
| nih-grants-mcp | Organization profile | ~$0.08 |
| healthcare-compliance-mcp | Clinical trial search | ~$0.05 |

Full academic due diligence (4 MCP calls): ~$0.21 per report

## Next Steps

1. Clone the [nih-grants-mcp](https://github.com/red-cars-io/nih-grants-mcp) repo
2. Copy `.env.example` to `.env` and add your `APIFY_API_TOKEN`
3. Run `npm install`
4. Try the examples: `node examples/grant-research.js`

## Related Repositories

- [Healthcare Compliance MCP](https://github.com/red-cars-io/healthcare-compliance-mcp) - FDA device approvals, MAUDE, 510(k), ClinicalTrials
- [Academic Research MCP](https://github.com/red-cars-io/academic-research-mcp) - Scholar search, citations, author profiles
- [Drug Intelligence MCP](https://github.com/red-cars-io/drug-intelligence-mcp) - FDA drug labels, adverse events, recalls
- [Research Agent Starter](https://github.com/red-cars-io/research-agent-starter) - Full multi-MCP tutorial
