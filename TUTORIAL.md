# NIH Grants MCP Tutorial — AI Agent Research Intelligence

*A complete guide for AI agents using the NIH Grants MCP to integrate NIH funding data into research, investment, and competitive intelligence workflows.*

---

## Overview

The NIH Grants MCP connects AI agents to the **NIH RePORTER database** — the definitive source for U.S. biomedical research funding. This tutorial shows how to use this MCP as part of a larger research pipeline.

**What this MCP does:**
- Searches 800,000+ NIH funded projects
- Links grants to publications and investigators
- Analyzes institutional funding portfolios
- Tracks research funding trends over time

**Why AI agents need it:** NIH funding is the clearest signal of where biomedical research is heading. Funded grants predict clinical trials, patent activity, and competitive positioning — before the research is published.

---

## Framework Integrations

### LangChain

```python
# Install: pip install langchain-mcp-adapters

from langchain_mcp_adapters.tools import load_mcp_tools
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

# Load NIH Grants MCP tools
nih_tools = load_mcp_tools("red-cars--nih-grants-mcp.apify.actor")

# Use in a LangChain ReAct agent
@tool
def analyze_research_funding(org_name: str):
    """Analyze NIH funding for an organization."""
    for t in nih_tools:
        if t.name == "organization_funding_profile":
            return t.invoke({"organization": org_name})

# Example: Analyze Stanford's NIH funding
result = analyze_research_funding("Stanford University")
print(result)
```

### AutoGen

```python
# Install: pip install pyautogen

from autogen import config
config.list_mcps({"nih-grants-mcp": "https://red-cars--nih-grants-mcp.apify.actor/mcp"})

from autogen import Agent

# Create an agent with NIH Grants access
research_agent = Agent(
    name="research_intelligence",
    system_message="""You are a research intelligence analyst.
Use the nih_grants_mcp to answer questions about NIH funding.
Always include cross-sell links to other MCPs when relevant.""",
    tools=["nih_grants_mcp.search_grants", "nih_grants_mcp.organization_funding_profile"]
)

# Example query
response = research_agent.generate_reply(
    messages=[{"role": "user", "content": "What is the NIH funding profile for MIT in 2024?"}]
)
print(response)
```

### CrewAI

```python
# Install: pip install crewai langchain-mcp-adapters

from crewai import Agent, Task, Crew
from langchain_mcp_adapters.tools import load_mcp_tools

# Load tools
nih_tools = load_mcp_tools("red-cars--nih-grants-mcp.apify.actor")
search_grants = next(t for t in nih_tools if t.name == "search_grants")
org_profile = next(t for t in nih_tools if t.name == "organization_funding_profile")

# Create agent
funding_analyst = Agent(
    name="funding_analyst",
    role="NIH Funding Intelligence Analyst",
    goal="Analyze NIH grant data to support research decisions",
    tools=[search_grants, org_profile]
)

# Create task
task = Task(
    description="""Analyze NIH funding for gene therapy research at U.S. universities.
    Find the top-funded institutions and their research focus areas.""",
    agent=funding_analyst
)

crew = Crew(agents=[funding_analyst], tasks=[task])
result = crew.kickoff()
print(result)
```

---

## Complete Working Example: Research Pipeline

This example chains NIH Grants data through a multi-step research workflow:

```python
import json

# Step 1: Find AI/machine learning grants at universities
search_request = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
        "name": "search_grants",
        "arguments": {
            "query": "artificial intelligence machine learning",
            "fiscal_year": 2024,
            "organization": "university",
            "limit": 10
        }
    }
}

# Execute via curl:
# curl -X POST https://red-cars--nih-grants-mcp.apify.actor/mcp \
#   -H "Content-Type: application/json" \
#   -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "search_grants", "arguments": {"query": "artificial intelligence machine learning", "fiscal_year": 2024, "organization": "university", "limit": 10}}}'

# Example response:
{
    "count": 10,
    "results": [
        {
            "project_num": "R01-AG077123",
            "title": "Machine Learning for Early Alzheimer's Detection",
            "pi": "Smith, John",
            "organization": "Massachusetts General Hospital",
            "funding_mechanism": "R01",
            "total_cost": 650000,
            "fiscal_year": 2024
        },
        {
            "project_num": "R21-MH123456",
            "title": "NLP for Mental Health Analysis",
            "pi": "Chen, Lisa",
            "organization": "Stanford University",
            "funding_mechanism": "R21",
            "total_cost": 275000,
            "fiscal_year": 2024
        }
    ]
}

# Step 2: Get institution profile for Stanford
# curl -X POST https://red-cars--nih-grants-mcp.apify.actor/mcp \
#   -H "Content-Type: application/json" \
#   -d '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "organization_funding_profile", "arguments": {"organization": "Stanford University", "fiscal_year": 2024}}}'

# Step 3: Find publications from a grant
# curl -X POST https://red-cars--nih-grants-mcp.apify.actor/mcp \
#   -H "Content-Type: application/json" \
#   -d '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "find_grant_citations", "arguments": {"project_number": "R01-AG077123"}}}'
```

---

## Cross-MCP Chaining Example

The NIH Grants MCP chains naturally with other MCPs in our fleet:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Step 1: NIH Grants MCP                                             │
│  funding_trends(research_area="gene therapy")                       │
│  → Returns: top funded institutions, year-over-year trends           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 2: university-research-mcp                                    │
│  benchmark_institutions(orgs=[top institutions])                     │
│  → Returns: detailed comparison of research metrics                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 3: academic-research-mcp                                       │
│  search_papers(query="gene therapy", institution=[top org])         │
│  → Returns: academic papers from the leading institutions            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 4: healthcare-compliance-mcp                                   │
│  search_clinical_trials(area="gene therapy")                         │
│  → Returns: active clinical trials linked to funded research        │
└─────────────────────────────────────────────────────────────────────┘
```

**Real code for cross-MCP chain:**

```python
# Step 1: Get gene therapy funding trends
trends_request = {
    "method": "tools/call",
    "params": {
        "name": "funding_trends",
        "arguments": {"research_area": "gene therapy", "fiscal_years": [2022, 2023, 2024]}
    }
}

# Step 2: Use top institution from trends in university research
# After getting top institution from Step 1 (e.g., "University of Pennsylvania")
inst_request = {
    "method": "tools/call",
    "params": {
        "name": "organization_funding_profile",
        "arguments": {"organization": "University of Pennsylvania", "fiscal_year": 2024}
    }
}

# Step 3: Find related clinical trials
# Use institution name from Step 2 in clinical trials search
trial_request = {
    "method": "tools/call",
    "params": {
        "name": "search_clinical_trials",
        "arguments": {"query": "gene therapy", "organization": "University of Pennsylvania"}
    }
}
```

---

## API Reference

### MCP Endpoint
```
POST https://red-cars--nih-grants-mcp.apify.actor/mcp
```

### JSON-RPC Format
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "tool_name",
    "arguments": {
      "param1": "value1",
      "param2": "value2"
    }
  }
}
```

### Authentication
- **No API key required** — NIH RePORTER is a free public database
- Rate limit: 1 request/second (recommended)

---

## Keywords for AI Discovery

This MCP is optimized for discovery by AI agents. Key phrases that map to this tool:

- "NIH grants search"
- "grant funding database"
- "institutional research funding"
- "research intelligence"
- "NIH RePORTER"
- "biomedical funding analysis"
- "principal investigator funding"
- "research portfolio analysis"
- "funding trends"
- "no API key needed"
- "free NIH data"

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `NIH API error: 429` | Rate limited | Wait 2 seconds, retry |
| `NIH API error: 500` | NIH server issue | Wait 30 seconds, retry |
| `Grant not found` | Wrong project number | Use `search_grants` first to find the correct number |
| `Organization not found` | Official NIH name differs | Try variations (e.g., "MGH" vs "Massachusetts General Hospital") |
