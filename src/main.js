/**
 * NIH Grants MCP Server
 * NIH RePORTER grant intelligence for AI agents.
 * Data source: NIH RePORTER API (free, no auth required)
 */

import http from 'http';
import Apify, { Actor } from 'apify';

// MCP manifest
const MCP_MANIFEST = {
    schema_version: "1.0",
    name: "nih-grants-mcp",
    version: "1.0.0",
    description: "NIH RePORTER grant intelligence for AI agents. Search NIH grants, publications, organization funding profiles, researcher career data, and funding trends.",
    tools: [
        {
            name: "search_grants",
            description: "Search NIH grants by query, organization, PI, or fiscal year",
            input_schema: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Search query (e.g., 'cancer', 'Alzheimer', 'COVID-19')" },
                    organization: { type: "string", description: "Organization/institution name" },
                    pi_name: { type: "string", description: "Principal investigator name" },
                    fiscal_year: { type: "integer", description: "Fiscal year (e.g., 2024)" },
                    limit: { type: "integer", description: "Maximum results (default: 10)", default: 10 }
                }
            },
            output_schema: {
                type: "object",
                properties: {
                    query: { type: "object", description: "The original search parameters" },
                    total_grants: { type: "integer", description: "Total matching grants" },
                    grants: {
                        type: "array",
                        description: "List of grant records",
                        items: {
                            type: "object",
                            properties: {
                                project_num: { type: "string", description: "NIH project number (e.g., '1R01CA123456-01')" },
                                project_title: { type: "string", description: "Project title" },
                                pi_name: { type: "string", description: "Principal investigator name" },
                                pi_email: { type: "string", description: "PI email" },
                                organization: { type: "string", description: "Awarded organization" },
                                total_cost: { type: "number", description: "Total cost in USD" },
                                direct_cost: { type: "number", description: "Direct cost in USD" },
                                agency_code: { type: "string", description: "NIH institute/center code" },
                                funding_mechanism: { type: "string", description: "Funding mechanism (e.g., 'R01')" },
                                start_date: { type: "string", description: "Project start date" },
                                end_date: { type: "string", description: "Project end date" },
                                core_project_num: { type: "string", description: "Core project number" },
                                program_reference: { type: "string", description: "Program reference" }
                            }
                        }
                    },
                    source: { type: "string", description: "Data source (NIH RePORTER)" }
                }
            },
            price: 0.05
        },
        {
            name: "get_grant_details",
            description: "Get detailed information for a specific grant by project number",
            input_schema: {
                type: "object",
                properties: {
                    project_number: { type: "string", description: "NIH project number (e.g., '1R01CA123456-01')", required: true }
                }
            },
            output_schema: {
                type: "object",
                properties: {
                    query: { type: "object", description: "The original search parameters" },
                    grant: {
                        type: "object",
                        description: "Detailed grant information",
                        properties: {
                            project_num: { type: "string", description: "NIH project number" },
                            project_title: { type: "string", description: "Project title" },
                            pi_name: { type: "string", description: "Principal investigator" },
                            pi_email: { type: "string", description: "PI email" },
                            organization: { type: "string", description: "Awarded organization" },
                            total_cost: { type: "number", description: "Total cost in USD" },
                            total_cost_5: { type: "number", description: "Total cost in 5th year" },
                            direct_cost: { type: "number", description: "Direct cost in USD" },
                            indirect_cost: { type: "number", description: "Indirect cost in USD" },
                            agency_code: { type: "string", description: "NIH institute/center code" },
                            agency_name: { type: "string", description: "NIH institute/center name" },
                            funding_mechanism: { type: "string", description: "Funding mechanism" },
                            activity_code: { type: "string", description: "Activity code (e.g., 'CA')" },
                            institute_code: { type: "string", description: "Institute code" },
                            start_date: { type: "string", description: "Start date" },
                            end_date: { type: "string", description: "End date" },
                            core_project_num: { type: "string", description: "Core project number" },
                            program_reference: { type: "string", description: "Program reference" },
                            award_notice_date: { type: "string", description: "Award notice date" },
                            budget_start_date: { type: "string", description: "Budget start date" },
                            budget_end_date: { type: "string", description: "Budget end date" },
                            fiscal_year: { type: "integer", description: "Fiscal year" }
                        }
                    },
                    source: { type: "string", description: "Data source (NIH RePORTER)" }
                }
            },
            price: 0.03
        },
        {
            name: "find_grant_citations",
            description: "Find publications linked to a specific NIH grant",
            input_schema: {
                type: "object",
                properties: {
                    project_number: { type: "string", description: "NIH project number (e.g., '1R01CA123456-01')", required: true },
                    limit: { type: "integer", description: "Maximum results (default: 10)", default: 10 }
                }
            },
            output_schema: {
                type: "object",
                properties: {
                    query: { type: "object", description: "The original search parameters" },
                    total_citations: { type: "integer", description: "Total matching publications" },
                    citations: {
                        type: "array",
                        description: "List of publication records",
                        items: {
                            type: "object",
                            properties: {
                                pmid: { type: "string", description: "PubMed ID" },
                                article_title: { type: "string", description: "Article title" },
                                authors: { type: "array", items: { type: "string" }, description: "Author list" },
                                journal_title: { type: "string", description: "Journal name" },
                                publication_date: { type: "string", description: "Publication date" },
                                abstract: { type: "string", description: "Abstract text" },
                                project_num: { type: "string", description: "Associated project number" },
                                core_project_num: { type: "string", description: "Core project number" }
                            }
                        }
                    },
                    source: { type: "string", description: "Data source (NIH RePORTER Publications)" }
                }
            },
            price: 0.03
        },
        {
            name: "organization_funding_profile",
            description: "Get aggregate funding totals for an institution across all NIH grants",
            input_schema: {
                type: "object",
                properties: {
                    organization: { type: "string", description: "Organization/institution name (e.g., 'Harvard University')", required: true },
                    fiscal_year: { type: "integer", description: "Fiscal year (e.g., 2024)" },
                    limit: { type: "integer", description: "Maximum results (default: 10)", default: 10 }
                }
            },
            output_schema: {
                type: "object",
                properties: {
                    query: { type: "object", description: "The original search parameters" },
                    organization: { type: "string", description: "Organization name" },
                    fiscal_year: { type: "integer", description: "Fiscal year" },
                    total_funding: { type: "number", description: "Total funding in USD" },
                    total_grants: { type: "integer", description: "Total number of grants" },
                    top_funding_areas: {
                        type: "array",
                        description: "Top funded research areas",
                        items: {
                            type: "object",
                            properties: {
                                agency_name: { type: "string", description: "NIH institute/center" },
                                total_cost: { type: "number", description: "Total cost in USD" },
                                grant_count: { type: "integer", description: "Number of grants" }
                            }
                        }
                    },
                    grants: {
                        type: "array",
                        description: "List of grants",
                        items: {
                            type: "object",
                            properties: {
                                project_num: { type: "string", description: "Project number" },
                                project_title: { type: "string", description: "Project title" },
                                pi_name: { type: "string", description: "PI name" },
                                total_cost: { type: "number", description: "Total cost in USD" },
                                funding_mechanism: { type: "string", description: "Funding mechanism" },
                                agency_name: { type: "string", description: "NIH institute/center" }
                            }
                        }
                    },
                    source: { type: "string", description: "Data source (NIH RePORTER)" }
                }
            },
            price: 0.08
        },
        {
            name: "researcher_profile",
            description: "Get career funding history and statistics for a principal investigator",
            input_schema: {
                type: "object",
                properties: {
                    pi_name: { type: "string", description: "Principal investigator name (e.g., 'John Smith')", required: true },
                    limit: { type: "integer", description: "Maximum results (default: 10)", default: 10 }
                }
            },
            output_schema: {
                type: "object",
                properties: {
                    query: { type: "object", description: "The original search parameters" },
                    researcher: { type: "string", description: "Researcher name" },
                    total_career_funding: { type: "number", description: "Total career funding in USD" },
                    total_grants: { type: "integer", description: "Total number of grants" },
                    active_grants: { type: "integer", description: "Number of active grants" },
                    yearly_funding: {
                        type: "array",
                        description: "Yearly funding breakdown",
                        items: {
                            type: "object",
                            properties: {
                                fiscal_year: { type: "integer", description: "Fiscal year" },
                                total_cost: { type: "number", description: "Total cost in USD" },
                                grant_count: { type: "integer", description: "Number of grants" }
                            }
                        }
                    },
                    grants: {
                        type: "array",
                        description: "List of grants",
                        items: {
                            type: "object",
                            properties: {
                                project_num: { type: "string", description: "Project number" },
                                project_title: { type: "string", description: "Project title" },
                                organization: { type: "string", description: "Organization" },
                                total_cost: { type: "number", description: "Total cost in USD" },
                                fiscal_year: { type: "integer", description: "Fiscal year" },
                                funding_mechanism: { type: "string", description: "Funding mechanism" },
                                agency_name: { type: "string", description: "NIH institute/center" }
                            }
                        }
                    },
                    source: { type: "string", description: "Data source (NIH RePORTER)" }
                }
            },
            price: 0.05
        },
        {
            name: "funding_trends",
            description: "Get aggregate funding statistics by research area, organization type, or geography",
            input_schema: {
                type: "object",
                properties: {
                    research_area: { type: "string", description: "Research area/category (e.g., 'cancer', 'neuroscience', 'immunology')" },
                    fiscal_year: { type: "integer", description: "Fiscal year (e.g., 2024)" },
                    limit: { type: "integer", description: "Maximum results (default: 10)", default: 10 }
                }
            },
            output_schema: {
                type: "object",
                properties: {
                    query: { type: "object", description: "The original search parameters" },
                    fiscal_year: { type: "integer", description: "Fiscal year" },
                    total_funding: { type: "number", description: "Total funding in USD" },
                    total_grants: { type: "integer", description: "Total number of grants" },
                    average_grant_size: { type: "number", description: "Average grant size in USD" },
                    top_organizations: {
                        type: "array",
                        description: "Top funded organizations",
                        items: {
                            type: "object",
                            properties: {
                                organization: { type: "string", description: "Organization name" },
                                total_cost: { type: "number", description: "Total cost in USD" },
                                grant_count: { type: "integer", description: "Number of grants" }
                            }
                        }
                    },
                    top_funding_mechanisms: {
                        type: "array",
                        description: "Top funding mechanisms",
                        items: {
                            type: "object",
                            properties: {
                                funding_mechanism: { type: "string", description: "Funding mechanism" },
                                total_cost: { type: "number", description: "Total cost in USD" },
                                grant_count: { type: "integer", description: "Number of grants" }
                            }
                        }
                    },
                    source: { type: "string", description: "Data source (NIH RePORTER)" }
                }
            },
            price: 0.08
        }
    ]
};

// Tool price map (in USD)
const TOOL_PRICES = {
    "search_grants": 0.05,
    "get_grant_details": 0.03,
    "find_grant_citations": 0.03,
    "organization_funding_profile": 0.08,
    "researcher_profile": 0.05,
    "funding_trends": 0.08
};

// ============================================
// NIH RePORTER API CLIENTS
// ============================================

const NIH_API_BASE = 'https://api.reporter.nih.gov/v2';

async function fetchNIH(endpoint, searchParams = {}, method = 'POST') {
    try {
        const url = `${NIH_API_BASE}/${endpoint}`;
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };

        let response;
        if (method === 'POST' && Object.keys(searchParams).length > 0) {
            options.body = JSON.stringify(searchParams);
            response = await fetch(url, options);
        } else {
            response = await fetch(url, options);
        }

        if (!response.ok) {
            console.error(`NIH API error (${endpoint}): HTTP ${response.status}`);
            return null;
        }

        return await response.json();
    } catch (e) {
        console.error(`NIH API error (${endpoint}):`, e.message);
        return null;
    }
}

// ============================================
// SEARCH GRANTS
// ============================================

async function searchGrants(params = {}) {
    const searchBody = {
        criteria: {},
        offset: 0,
        limit: params.limit || 10
    };

    if (params.query) {
        searchBody.criteria.text_search = params.query;
    }
    if (params.organization) {
        searchBody.criteria.organization = { name: params.organization };
    }
    if (params.pi_name) {
        searchBody.criteria.principal_awardees = { name: params.pi_name };
    }
    if (params.fiscal_year) {
        searchBody.criteria.fiscal_year = [params.fiscal_year];
    }

    const result = await fetchNIH('projects/search', searchBody);

    if (!result || !result.results) {
        return {
            query: params,
            total_grants: 0,
            grants: [],
            source: "NIH RePORTER"
        };
    }

    const grants = result.results.map(g => ({
        project_num: g.project_num || '',
        project_title: g.project_title || '',
        pi_name: Array.isArray(g.pi_name) ? g.pi_name[0] : (g.pi_name || ''),
        pi_email: g.pi_email || '',
        organization: (g.organization && typeof g.organization === 'object') ? g.organization.org_name : (g.organization || ''),
        total_cost: g.total_cost || 0,
        direct_cost: g.direct_cost || 0,
        agency_code: g.agency_code || '',
        funding_mechanism: g.funding_mechanism || '',
        start_date: g.project_start_date || '',
        end_date: g.project_end_date || '',
        core_project_num: g.core_project_num || '',
        program_reference: g.program_reference || ''
    }));

    return {
        query: params,
        total_grants: result.total || grants.length,
        grants,
        source: "NIH RePORTER"
    };
}

// ============================================
// GET GRANT DETAILS
// ============================================

async function getGrantDetails(params = {}) {
    const projectNumber = params.project_number;
    if (!projectNumber) {
        return { error: 'project_number is required' };
    }

    const searchBody = {
        criteria: {
            project_nums: [projectNumber]
        },
        offset: 0,
        limit: 1
    };

    const result = await fetchNIH('projects/search', searchBody);

    if (!result || !result.results || result.results.length === 0) {
        return {
            query: params,
            grant: null,
            source: "NIH RePORTER"
        };
    }

    const g = result.results[0];
    return {
        query: params,
        grant: {
            project_num: g.project_num || '',
            project_title: g.project_title || '',
            pi_name: Array.isArray(g.pi_name) ? g.pi_name[0] : (g.pi_name || ''),
            pi_email: g.pi_email || '',
            organization: (g.organization && typeof g.organization === 'object') ? g.organization.org_name : (g.organization || ''),
            total_cost: g.total_cost || 0,
            total_cost_5: g.total_cost_5 || 0,
            direct_cost: g.direct_cost || 0,
            indirect_cost: g.indirect_cost || 0,
            agency_code: g.agency_code || '',
            agency_name: g.agency_name || '',
            funding_mechanism: g.funding_mechanism || '',
            activity_code: g.activity_code || '',
            institute_code: g.institute_code || '',
            start_date: g.project_start_date || '',
            end_date: g.project_end_date || '',
            core_project_num: g.core_project_num || '',
            program_reference: g.program_reference || '',
            award_notice_date: g.award_notice_date || '',
            budget_start_date: g.budget_start_date || '',
            budget_end_date: g.budget_end_date || '',
            fiscal_year: g.fiscal_year || 0
        },
        source: "NIH RePORTER"
    };
}

// ============================================
// FIND GRANT CITATIONS
// ============================================

async function findGrantCitations(params = {}) {
    const projectNumber = params.project_number;
    if (!projectNumber) {
        return { error: 'project_number is required' };
    }

    const searchBody = {
        criteria: {
            project_nums: [projectNumber]
        },
        offset: 0,
        limit: params.limit || 10
    };

    const result = await fetchNIH('publications/search', searchBody);

    if (!result || !result.results) {
        return {
            query: params,
            total_citations: 0,
            citations: [],
            source: "NIH RePORTER Publications"
        };
    }

    const citations = result.results.map(p => ({
        pmid: p.pmid || '',
        article_title: p.article_title || '',
        authors: p.authors || [],
        journal_title: p.journal_title || '',
        publication_date: p.publication_date || '',
        abstract: p.abstract || '',
        project_num: Array.isArray(p.project_nums) ? p.project_nums[0] : (p.project_nums || ''),
        core_project_num: p.core_project_num || ''
    }));

    return {
        query: params,
        total_citations: result.total || citations.length,
        citations,
        source: "NIH RePORTER Publications"
    };
}

// ============================================
// ORGANIZATION FUNDING PROFILE
// ============================================

async function organizationFundingProfile(params = {}) {
    if (!params.organization) {
        return { error: 'organization is required' };
    }

    const searchBody = {
        criteria: {
            organization: { name: params.organization }
        },
        offset: 0,
        limit: params.limit || 10
    };

    if (params.fiscal_year) {
        searchBody.criteria.fiscal_year = [params.fiscal_year];
    }

    const result = await fetchNIH('projects/search', searchBody);

    if (!result || !result.results) {
        return {
            query: params,
            organization: params.organization,
            fiscal_year: params.fiscal_year || null,
            total_funding: 0,
            total_grants: 0,
            top_funding_areas: [],
            grants: [],
            source: "NIH RePORTER"
        };
    }

    const grants = result.results.map(g => ({
        project_num: g.project_num || '',
        project_title: g.project_title || '',
        pi_name: Array.isArray(g.pi_name) ? g.pi_name[0] : (g.pi_name || ''),
        total_cost: g.total_cost || 0,
        funding_mechanism: g.funding_mechanism || '',
        agency_name: g.agency_name || ''
    }));

    const agencyMap = {};
    grants.forEach(g => {
        const agency = g.agency_name || 'Unknown';
        if (!agencyMap[agency]) {
            agencyMap[agency] = { agency_name: agency, total_cost: 0, grant_count: 0 };
        }
        agencyMap[agency].total_cost += g.total_cost || 0;
        agencyMap[agency].grant_count += 1;
    });

    const topFundingAreas = Object.values(agencyMap)
        .sort((a, b) => b.total_cost - a.total_cost)
        .slice(0, 5);

    const totalFunding = grants.reduce((sum, g) => sum + (g.total_cost || 0), 0);

    return {
        query: params,
        organization: params.organization,
        fiscal_year: params.fiscal_year || null,
        total_funding: totalFunding,
        total_grants: result.total || grants.length,
        top_funding_areas: topFundingAreas,
        grants,
        source: "NIH RePORTER"
    };
}

// ============================================
// RESEARCHER PROFILE
// ============================================

async function researcherProfile(params = {}) {
    if (!params.pi_name) {
        return { error: 'pi_name is required' };
    }

    const searchBody = {
        criteria: {
            principal_awardees: { name: params.pi_name }
        },
        offset: 0,
        limit: params.limit || 10
    };

    const result = await fetchNIH('projects/search', searchBody);

    if (!result || !result.results) {
        return {
            query: params,
            researcher: params.pi_name,
            total_career_funding: 0,
            total_grants: 0,
            active_grants: 0,
            yearly_funding: [],
            grants: [],
            source: "NIH RePORTER"
        };
    }

    const grants = result.results.map(g => ({
        project_num: g.project_num || '',
        project_title: g.project_title || '',
        organization: (g.organization && typeof g.organization === 'object') ? g.organization.org_name : (g.organization || ''),
        total_cost: g.total_cost || 0,
        fiscal_year: g.fiscal_year || 0,
        funding_mechanism: g.funding_mechanism || '',
        agency_name: g.agency_name || ''
    }));

    const yearMap = {};
    grants.forEach(g => {
        const year = g.fiscal_year || 0;
        if (!yearMap[year]) {
            yearMap[year] = { fiscal_year: year, total_cost: 0, grant_count: 0 };
        }
        yearMap[year].total_cost += g.total_cost || 0;
        yearMap[year].grant_count += 1;
    });

    const yearlyFunding = Object.values(yearMap).sort((a, b) => b.fiscal_year - a.fiscal_year);
    const totalCareerFunding = grants.reduce((sum, g) => sum + (g.total_cost || 0), 0);

    const currentYear = new Date().getFullYear();
    const activeGrants = grants.filter(g => {
        const endYear = parseInt(g.project_end_date?.split('-')[0] || '0');
        return endYear >= currentYear;
    }).length;

    return {
        query: params,
        researcher: params.pi_name,
        total_career_funding: totalCareerFunding,
        total_grants: result.total || grants.length,
        active_grants: activeGrants,
        yearly_funding: yearlyFunding,
        grants,
        source: "NIH RePORTER"
    };
}

// ============================================
// FUNDING TRENDS
// ============================================

async function fundingTrends(params = {}) {
    const searchBody = {
        criteria: {},
        offset: 0,
        limit: params.limit || 10
    };

    if (params.research_area) {
        searchBody.criteria.text_search = params.research_area;
    }
    if (params.fiscal_year) {
        searchBody.criteria.fiscal_year = [params.fiscal_year];
    }

    const result = await fetchNIH('projects/search', searchBody);

    if (!result || !result.results) {
        return {
            query: params,
            fiscal_year: params.fiscal_year || null,
            total_funding: 0,
            total_grants: 0,
            average_grant_size: 0,
            top_organizations: [],
            top_funding_mechanisms: [],
            source: "NIH RePORTER"
        };
    }

    const grants = result.results;
    const totalFunding = grants.reduce((sum, g) => sum + (g.total_cost || 0), 0);
    const totalGrants = result.total || grants.length;
    const averageGrantSize = totalGrants > 0 ? totalFunding / totalGrants : 0;

    const orgMap = {};
    grants.forEach(g => {
        const org = g.organization || 'Unknown';
        if (!orgMap[org]) {
            orgMap[org] = { organization: org, total_cost: 0, grant_count: 0 };
        }
        orgMap[org].total_cost += g.total_cost || 0;
        orgMap[org].grant_count += 1;
    });

    const topOrganizations = Object.values(orgMap)
        .sort((a, b) => b.total_cost - a.total_cost)
        .slice(0, 5);

    const mechanismMap = {};
    grants.forEach(g => {
        const mech = g.funding_mechanism || 'Unknown';
        if (!mechanismMap[mech]) {
            mechanismMap[mech] = { funding_mechanism: mech, total_cost: 0, grant_count: 0 };
        }
        mechanismMap[mech].total_cost += g.total_cost || 0;
        mechanismMap[mech].grant_count += 1;
    });

    const topFundingMechanisms = Object.values(mechanismMap)
        .sort((a, b) => b.total_cost - a.total_cost)
        .slice(0, 5);

    return {
        query: params,
        fiscal_year: params.fiscal_year || null,
        total_funding: totalFunding,
        total_grants: totalGrants,
        average_grant_size: averageGrantSize,
        top_organizations: topOrganizations,
        top_funding_mechanisms: topFundingMechanisms,
        source: "NIH RePORTER"
    };
}

// ============================================
// REQUEST HANDLER
// ============================================

async function handleTool(toolName, params = {}) {
    const handlers = {
        "search_grants": async () => searchGrants(params),
        "get_grant_details": async () => getGrantDetails(params),
        "find_grant_citations": async () => findGrantCitations(params),
        "organization_funding_profile": async () => organizationFundingProfile(params),
        "researcher_profile": async () => researcherProfile(params),
        "funding_trends": async () => fundingTrends(params)
    };

    const handler = handlers[toolName];
    if (handler) {
        const result = await handler();
        const price = TOOL_PRICES[toolName];
        if (price) {
            try {
                await Actor.charge(price, { eventName: toolName });
            } catch (e) {
                console.error("Charge failed:", e.message);
            }
        }
        return result;
    }
    return { error: `Unknown tool: ${toolName}` };
}

// ============================================
// HTTP SERVER FOR STANDBY MODE
// ============================================

await Actor.init();

const isStandby = Actor.config.get('metaOrigin') === 'STANDBY';

if (isStandby) {
    const PORT = Actor.config.get('containerPort') || process.env.ACTOR_WEB_SERVER_PORT || 3000;

    const server = http.createServer(async (req, res) => {
        if (req.headers['x-apify-container-server-readiness-probe']) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('OK');
            return;
        }

        if (req.method === 'POST' && req.url === '/mcp') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    const jsonBody = JSON.parse(body);
                    const id = jsonBody.id ?? null;

                    const reply = (result) => {
                        const resp = id !== null
                            ? { jsonrpc: '2.0', id, result }
                            : result;
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(resp));
                    };

                    const replyError = (code, message) => {
                        const resp = id !== null
                            ? { jsonrpc: '2.0', id, error: { code, message } }
                            : { status: 'error', error: message };
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(resp));
                    };

                    const method = jsonBody.method;

                    if (method === 'initialize') {
                        return reply({
                            protocolVersion: '2024-11-05',
                            capabilities: { tools: {} },
                            serverInfo: { name: 'nih-grants-mcp', version: '1.0.0' }
                        });
                    }

                    if (method === 'tools/list' || (!method && jsonBody.tool === 'list')) {
                        return reply({ tools: MCP_MANIFEST.tools });
                    }

                    if (method === 'tools/call') {
                        const toolName = jsonBody.params?.name;
                        const toolArgs = jsonBody.params?.arguments || {};
                        if (!toolName) return replyError(-32602, 'Missing params.name');
                        const toolResult = await handleTool(toolName, toolArgs);
                        return reply({
                            content: [{ type: 'text', text: JSON.stringify(toolResult, null, 2) }]
                        });
                    }

                    if (method && method.startsWith('tools/')) {
                        const toolName = method.slice(6);
                        const toolArgs = jsonBody.params || {};
                        const toolResult = await handleTool(toolName, toolArgs);
                        return reply({
                            content: [{ type: 'text', text: JSON.stringify(toolResult, null, 2) }]
                        });
                    }

                    if (jsonBody.tool) {
                        const toolResult = await handleTool(jsonBody.tool, jsonBody.params || {});
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'success', result: toolResult }));
                        return;
                    }

                    replyError(-32601, `Method not found: ${method}`);
                } catch (error) {
                    console.error('MCP error:', error.message);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'error', error: error.message }));
                }
            });
            return;
        }

        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    });

    server.listen(PORT, () => {
        console.log(`NIH Grants MCP listening on port ${PORT}`);
    });

    process.on('SIGTERM', () => {
        server.close(() => process.exit(0));
    });
} else {
    const input = await Actor.getInput();
    if (input) {
        const { tool, params = {} } = input;
        if (tool) {
            console.log(`Running tool: ${tool}`);
            const result = await handleTool(tool, params);
            await Actor.setValue('OUTPUT', result);
        }
    }
    await Actor.exit();
}

export default {
    handleRequest: async ({ request, response, log }) => {
        log.info("NIH Grants MCP received request");

        try {
            const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
            const id = body.id ?? null;
            const method = body.method;

            const reply = (result) => {
                const resp = id !== null
                    ? { jsonrpc: '2.0', id, result }
                    : result;
                response.send(resp);
            };

            const replyError = (code, message) => {
                const resp = id !== null
                    ? { jsonrpc: '2.0', id, error: { code, message } }
                    : { status: 'error', error: message };
                response.send(resp);
            };

            if (method === 'initialize') {
                log.info('MCP initialize');
                return reply({
                    protocolVersion: '2024-11-05',
                    capabilities: { tools: {} },
                    serverInfo: { name: 'nih-grants-mcp', version: '1.0.0' }
                });
            }

            if (method === 'tools/list' || (!method && body.tool === 'list')) {
                log.info('MCP tools/list');
                return reply({ tools: MCP_MANIFEST.tools });
            }

            if (method === 'tools/call') {
                const toolName = body.params?.name;
                const toolArgs = body.params?.arguments || {};
                if (!toolName) return replyError(-32602, 'Missing params.name');
                log.info(`MCP tools/call: ${toolName}`);
                const toolResult = await handleTool(toolName, toolArgs);
                return reply({
                    content: [{ type: 'text', text: JSON.stringify(toolResult, null, 2) }]
                });
            }

            const { tool, params = {} } = body;
            if (!tool) return replyError(-32602, 'Missing tool name');

            log.info(`Calling tool: ${tool}`);
            const result = await handleTool(tool, params);

            reply({ status: "success", result });
        } catch (error) {
            log.error(`Error: ${error.message}`);
            response.send({ status: "error", error: error.message });
        }
    }
};
