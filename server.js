require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const PORT = 3001;

const MOCK_MODE = false;


const README_LIMIT = 800;

const SKIP_REPOS = ['portfolio-data', 'React-Documentation', 'github-slideshow', 'random_generator', 'top-of-my-head', 'skills-integrate-mcp-with-copilot', 'Brighten-Up', , 'SajuLoom', 'zero2-bot', 'GlanceAt', 'attendence_system', 'Custom-Flutter-UI'];

const MOCK_RESPONSES = {
    about: {
        component: 'AboutCard',
        props: {
            summary: "I'm a full-stack engineer with 3+ years in production at Zoho. Currently doing MSc AI at NCI Dublin. I build things that ship.",
            highlights: [
                'I was Member Technical Staff at Zoho — ManageEngine AssetExplorer & ServiceDesk Plus',
                "I'm doing MSc Artificial Intelligence at NCI Dublin (2024–Present)",
                'I completed BSc Computer Science with a 9.16 GPA — Sri Krishna College, India',
            ],
        },
    },
    experience: {
        component: 'Timeline',
        props: {
            entries: [
                { period: '2024 – Present', title: 'MSc Artificial Intelligence · NCI Dublin', detail: 'Focusing on ML, NLP, and deep learning. Dublin, Ireland.' },
                { period: '2021 – 2024', title: 'Member Technical Staff · Zoho Corporation', detail: 'Full-stack engineer on ManageEngine AssetExplorer & ServiceDesk Plus. Java, Python, JS, PostgreSQL.' },
                { period: '2017 – 2021', title: 'BSc Computer Science · Sri Krishna College', detail: 'Graduated with 9.16 GPA. Chennai, India.' },
            ],
        },
    },
    projects: {
        component: 'ProjectList',
        props: {
            intro: "Here's what I've shipped:",
            projects: [
                { name: 'BayMax Chatbot', one_line: 'Voice-enabled AI shopping assistant with live Amazon scraping', stack: ['Python', 'Rasa', 'Flask'] },
                { name: 'Go-Safe', one_line: 'Real-time personal safety app with 2km distress beacons', stack: ['Flutter', 'Firebase'] },
                { name: 'Job Tracker', one_line: 'AI that auto-categorises job emails into a Kanban board', stack: ['Next.js', 'AWS Lambda', 'Gemini', 'AI Agent'] },
                { name: 'Graduate Earnings Predictor', one_line: 'ML pipeline predicting median weekly earnings from HE data', stack: ['Python', 'TensorFlow', 'Scikit-Learn'] },
            ],
        },
    },
    skills: {
        component: 'SkillList',
        props: {
            intro: "My stack — full-stack with an AI lean:",
            skills: [
                { name: 'Java',       level: 'strong',   context: '3 yrs production at Zoho' },
                { name: 'Python',     level: 'strong',   context: 'ML, Django, scripting' },
                { name: 'JavaScript', level: 'strong',   context: 'React, Node, Next.js' },
                { name: 'Flutter',    level: 'strong',   context: 'cross-platform mobile' },
                { name: 'PostgreSQL', level: 'strong',   context: 'production DB at Zoho' },
                { name: 'TensorFlow', level: 'familiar', context: '' },
                { name: 'Rasa NLP',   level: 'familiar', context: '' },
                { name: 'Docker',     level: 'familiar', context: '' },
                { name: 'Firebase',   level: 'familiar', context: '' },
                { name: 'AWS Lambda', level: 'familiar', context: '' },
            ],
        },
    },
    contact: {
        component: 'ContactCard',
        props: {
            message: "I'm open to work — let's build something.",
            email: 'sivaavanishk@gmail.com',
            availability: 'Open to work — available immediately',
        },
    },
    default: {
        component: 'TextResponse',
        props: { text: "I can talk about my experience, projects, skills, or how to reach me. What would you like to know?" },
    },
};

function getMockResponse(query) {
    const q = query.toLowerCase();
    if (q.match(/about|who|background|yourself/))     return MOCK_RESPONSES.about;
    if (q.match(/experience|work|zoho|career|job/))   return MOCK_RESPONSES.experience;
    if (q.match(/project|built|app|portfolio/))       return MOCK_RESPONSES.projects;
    if (q.match(/skill|tech|stack|language|python/))  return MOCK_RESPONSES.skills;
    if (q.match(/hire|contact|email|reach|available/)) return MOCK_RESPONSES.contact;
    return MOCK_RESPONSES.default;
}


const colors = {
    reset:   '\x1b[0m',
    dim:     '\x1b[2m',
    bold:    '\x1b[1m',
    cyan:    '\x1b[36m',
    green:   '\x1b[32m',
    yellow:  '\x1b[33m',
    red:     '\x1b[31m',
    blue:    '\x1b[34m',
    gray:    '\x1b[90m',
    magenta: '\x1b[35m',
    white:   '\x1b[97m',
    orange:  '\x1b[38;5;208m',
};

function timestamp() {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
}

const stats = { requests: 0, totalInputT: 0, totalOutputT: 0, totalCostUSD: 0, errors: 0 };

const COST_INPUT_PER_M  = 3.00;
const COST_OUTPUT_PER_M = 15.00;

function calcCost(i, o) {
    return (i / 1_000_000) * COST_INPUT_PER_M + (o / 1_000_000) * COST_OUTPUT_PER_M;
}
function formatCost(usd) {
    return usd < 0.0001 ? `<$0.0001` : `$${usd.toFixed(4)}`;
}
function bar(value, max, width = 20) {
    const filled = Math.min(Math.round((value / max) * width), width);
    return '█'.repeat(filled) + '░'.repeat(width - filled);
}

const log = {
    info:    (...args) => console.log(`${colors.gray}[${timestamp()}]${colors.reset} ${colors.cyan}ℹ${colors.reset}`, ...args),
    success: (...args) => console.log(`${colors.gray}[${timestamp()}]${colors.reset} ${colors.green}✓${colors.reset}`, ...args),
    warn:    (...args) => console.log(`${colors.gray}[${timestamp()}]${colors.reset} ${colors.yellow}⚠${colors.reset}`, ...args),
    error:   (...args) => console.log(`${colors.gray}[${timestamp()}]${colors.reset} ${colors.red}✗${colors.reset}`, ...args),
    request: (...args) => console.log(`${colors.gray}[${timestamp()}]${colors.reset} ${colors.blue}→${colors.reset}`, ...args),
    reply:   (...args) => console.log(`${colors.gray}[${timestamp()}]${colors.reset} ${colors.green}←${colors.reset}`, ...args),
    divider: ()        => console.log(`${colors.gray}${'─'.repeat(60)}${colors.reset}`),

    monitor({ query, historyTurns, intent, inputTokens, outputTokens, elapsedMs, component, propsKeys, rawOutput }) {
        const cost = calcCost(inputTokens, outputTokens);
        stats.requests++;
        stats.totalInputT  += inputTokens;
        stats.totalOutputT += outputTokens;
        stats.totalCostUSD += cost;

        console.log();
        console.log(`${colors.bold}${colors.white}  ┌─ REQUEST #${stats.requests} ───────────────────────────────────────┐${colors.reset}`);
        console.log(`${colors.bold}${colors.white}  │${colors.reset} ${colors.cyan}USER${colors.reset}    "${colors.white}${query}${colors.reset}"`);
        console.log(`${colors.bold}${colors.white}  │${colors.reset} ${colors.gray}History: ${historyTurns} turns  •  Time: ${elapsedMs}ms${colors.reset}`);
        console.log(`${colors.bold}${colors.white}  │${colors.reset} Intent  ${colors.magenta}${intent}${colors.reset}`);
        console.log(`${colors.bold}${colors.white}  ├─ TOKENS ──────────────────────────────────────────────────┤${colors.reset}`);
        console.log(`${colors.bold}${colors.white}  │${colors.reset} Input    ${colors.cyan}${String(inputTokens).padStart(5)}${colors.reset}  ${bar(inputTokens, 8000)}  (system+context+query)`);
        console.log(`${colors.bold}${colors.white}  │${colors.reset} Output   ${colors.green}${String(outputTokens).padStart(5)}${colors.reset}  ${bar(outputTokens, 1024)}  (JSON response)`);
        console.log(`${colors.bold}${colors.white}  │${colors.reset} Cost     ${colors.yellow}${formatCost(cost)}${colors.reset} this call`);
        console.log(`${colors.bold}${colors.white}  ├─ RESPONSE ────────────────────────────────────────────────┤${colors.reset}`);
        console.log(`${colors.bold}${colors.white}  │${colors.reset} Component  ${colors.orange}${component}${colors.reset}  ${colors.gray}← what Claude decided to render${colors.reset}`);
        console.log(`${colors.bold}${colors.white}  │${colors.reset} Props       ${colors.gray}${propsKeys}${colors.reset}`);
        console.log(`${colors.bold}${colors.white}  │${colors.reset} Raw[0:100]  ${colors.dim}${rawOutput.slice(0, 100).replace(/\n/g, ' ')}${colors.reset}`);
        console.log(`${colors.bold}${colors.white}  ├─ SESSION ─────────────────────────────────────────────────┤${colors.reset}`);
        console.log(`${colors.bold}${colors.white}  │${colors.reset} Requests   ${stats.requests}   Errors: ${stats.errors}`);
        console.log(`${colors.bold}${colors.white}  │${colors.reset} Total in   ${stats.totalInputT.toLocaleString()} tokens`);
        console.log(`${colors.bold}${colors.white}  │${colors.reset} Total out  ${stats.totalOutputT.toLocaleString()} tokens`);
        console.log(`${colors.bold}${colors.white}  │${colors.reset} Total cost ${colors.yellow}${formatCost(stats.totalCostUSD)}${colors.reset}`);
        console.log(`${colors.bold}${colors.white}  └───────────────────────────────────────────────────────────┘${colors.reset}`);
        console.log();
    },
};


const SYSTEM_PROMPT = `
You ARE Sivaavanish Kanagasabapathi. Speak entirely in first person — "I", "my", "I've built", "I worked at".
Never say "Siva" or refer to yourself in third person. You are him, not his assistant.

CRITICAL RULES:
- Always respond with a single valid JSON object. Never plain text.
- Never make up projects, numbers, or experience not in the knowledge base.
- If something isn't in the knowledge base, use TextResponse and say so honestly.
- Keep answers concise and specific — sound like a confident engineer talking about their own work.
- Never use vague phrases like "passionate about" — show expertise through specifics.
- Always use "I", "my", "I've", "I built", "I worked" — never "he", "his", "Siva".

AVAILABLE COMPONENTS:

ProjectCard — one specific project in detail
{
  "component": "ProjectCard",
  "props": {
    "title": "string",
    "description": "string",
    "stack": ["string"],
    "highlight": "string (optional — key metric or achievement)",
    "url": "string (optional — github url)"
  }
}

ProjectList — multiple projects overview
{
  "component": "ProjectList",
  "props": {
    "intro": "string",
    "projects": [{ "name": "string", "one_line": "string", "stack": ["string"] }]
  }
}

SkillList — skills and expertise
{
  "component": "SkillList",
  "props": {
    "intro": "string",
    "skills": [{ "name": "string", "level": "strong | familiar", "context": "string" }]
  }
}

AboutCard — who Siva is, background
{
  "component": "AboutCard",
  "props": {
    "summary": "string",
    "highlights": ["string"]
  }
}

Timeline — career history and growth
{
  "component": "Timeline",
  "props": {
    "entries": [{ "period": "string", "title": "string", "detail": "string" }]
  }
}

ContactCard — availability, hiring, how to reach
{
  "component": "ContactCard",
  "props": {
    "message": "string",
    "email": "string",
    "availability": "string"
  }
}

TextResponse — fallback for anything else
{
  "component": "TextResponse",
  "props": {
    "text": "string"
  }
}

Respond ONLY with the JSON object. No markdown, no explanation, no extra text.
`;


function formatKnowledge(knowledge) {
    let out = '';
    if (knowledge.portfolio && Object.keys(knowledge.portfolio).length > 0) {
        out += `PERSONAL INFO:\n${JSON.stringify(knowledge.portfolio, null, 2)}\n\n`;
    }
    out += 'PROJECTS & REPOS:\n';
    let repoCount = 0;
    for (const repo of knowledge.repos) {
        if (SKIP_REPOS.includes(repo.name)) continue;
        if (!repo.description && !repo.readme) continue;

        out += `\n## ${repo.name}\n`;
        if (repo.description) out += `Description: ${repo.description}\n`;
        if (repo.topics?.length) out += `Topics: ${repo.topics.join(', ')}\n`;
        out += `URL: ${repo.url}\n`;
        if (repo.readme) {
            const trimmed = repo.readme.slice(0, README_LIMIT);
            const wasTrimmed = repo.readme.length > README_LIMIT;
            out += `README:\n${trimmed}${wasTrimmed ? '\n[...truncated]' : ''}\n`;
        }
        out += '\n';
        repoCount++;
    }
    return { context: out, repoCount };
}

let cachedContext   = null;   
let cachedRepoCount = 0;
let personalInfo    = '';     
let repoContextMap  = {};     
let briefRepoList   = '';   

function loadKnowledgeCache() {
    const filePath = path.join(__dirname, 'data', 'knowledge.json');
    if (!fs.existsSync(filePath)) return false;

    const knowledge = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const { context, repoCount } = formatKnowledge(knowledge);
    cachedContext   = context;
    cachedRepoCount = repoCount;

    if (knowledge.portfolio && Object.keys(knowledge.portfolio).length > 0) {
        personalInfo = `PERSONAL INFO:\n${JSON.stringify(knowledge.portfolio, null, 2)}\n\n`;
    }

    let brief = 'PROJECTS & REPOS (overview):\n';
    for (const repo of knowledge.repos) {
        if (SKIP_REPOS.includes(repo.name)) continue;
        if (!repo.description && !repo.readme) continue;

        let entry = `\n## ${repo.name}\n`;
        if (repo.description) entry += `Description: ${repo.description}\n`;
        if (repo.topics?.length) entry += `Topics: ${repo.topics.join(', ')}\n`;
        entry += `URL: ${repo.url}\n`;
        if (repo.readme) {
            entry += `README:\n${repo.readme.slice(0, README_LIMIT)}${repo.readme.length > README_LIMIT ? '\n[...truncated]' : ''}\n`;
        }
        repoContextMap[repo.name] = entry;

        brief += `\n## ${repo.name}\n`;
        if (repo.description) brief += `Description: ${repo.description}\n`;
        if (repo.topics?.length) brief += `Topics: ${repo.topics.join(', ')}\n`;
        brief += `URL: ${repo.url}\n`;
    }
    briefRepoList = brief;

    log.success(`Knowledge cached — ${repoCount} repos, ~${Math.round(context.length / 4)} tokens (full)`);
    log.info(`Slices ready — personal: ~${Math.round(personalInfo.length / 4)}t  brief: ~${Math.round(briefRepoList.length / 4)}t  full: ~${Math.round(context.length / 4)}t`);
    return true;
}


const INTENTS = {
    ABOUT:            /\b(who|about|yourself|background|introduce|bio|summary|person)\b/i,
    CONTACT:          /\b(hire|contact|email|reach|available|availability|work together|opportunity|github|linkedin|resume|cv)\b/i,
    LOCATION:         /\b(where|location|based|dublin|ireland|india|remote|relocat|timezone|country|city)\b/i,
    EDUCATION:        /\b(study|studied|degree|university|college|nci|msc|bsc|masters|bachelor|school|academic|gpa)\b/i,
    SKILL_EXPERIENCE: /\bexperience (in|with|using)\b/i,
    SKILLS:           /\b(skill|tech|stack|language|know|expertise|proficient|tools|framework|library|ml|machine learning|llm|neural|deep learning|ai|agent|automation)\b/i,
    BROAD_PROJECTS:   /\b(all|top|best|list|projects|portfolio|built|made|created|show|apps|applications)\b/i,
    EXPERIENCE:       /\b(experience|career|work history|job|zoho|company|employment|timeline)\b/i,
};

function classifyIntent(query) {
    for (const [intent, pattern] of Object.entries(INTENTS)) {
        if (pattern.test(query)) return intent;
    }
    return 'UNKNOWN';
}

function findMatchingRepo(query) {
    const q = query.toLowerCase().replace(/[-_\s]/g, '');
    let bestMatch = null, bestScore = 0;

    for (const [name] of Object.entries(repoContextMap)) {
        let score = 0;
        const normName = name.toLowerCase().replace(/[-_\s]/g, '');

        if (q.includes(normName)) score += 10;

        for (const word of name.toLowerCase().split(/[-_\s]/)) {
            if (word.length > 3 && q.includes(word)) score += 3;
        }

        if (score > bestScore) { bestScore = score; bestMatch = name; }
    }
    return bestScore >= 3 ? bestMatch : null;
}

function selectContext(query) {
    const intent = classifyIntent(query);

    const matchedRepo = findMatchingRepo(query);
    if (matchedRepo) {
        const ctx = personalInfo + 'PROJECTS & REPOS:\n' + repoContextMap[matchedRepo];
        return { context: ctx, intent: `SPECIFIC(${matchedRepo})`, tokens: Math.round(ctx.length / 4) };
    }

    if (['ABOUT', 'CONTACT', 'LOCATION', 'EDUCATION'].includes(intent)) {
        return { context: personalInfo, intent, tokens: Math.round(personalInfo.length / 4) };
    }

    if (intent === 'EXPERIENCE') {
        return { context: personalInfo, intent, tokens: Math.round(personalInfo.length / 4) };
    }

    if (['SKILLS', 'SKILL_EXPERIENCE'].includes(intent)) {
        const ctx = personalInfo + briefRepoList;
        return { context: ctx, intent, tokens: Math.round(ctx.length / 4) };
    }

    return { context: cachedContext, intent: intent === 'UNKNOWN' ? 'FULL(fallback)' : intent, tokens: Math.round(cachedContext.length / 4) };
}


function sendJSON(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}


const server = http.createServer(async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'POST' || req.url !== '/api/chat') {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
    }

    log.divider();
    log.request(`POST /api/chat`);

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        const startTime = Date.now();

        try {
            const parsed = JSON.parse(body);
            const { query, history = [] } = parsed;

            log.info(`Query: "${query}"`);
            log.info(`History turns: ${history.length}`);

            if (MOCK_MODE) {
                const result = getMockResponse(query);
                log.warn(`MOCK MODE — returning ${result.component} (no API call)`);
                return sendJSON(res, 200, result);
            }

            if (!cachedContext) {
                log.error('Knowledge cache is empty — knowledge.json may be missing');
                return sendJSON(res, 200, {
                    component: 'TextResponse',
                    props: { text: 'Knowledge base not found.' },
                });
            }

            const { context, intent, tokens: contextTokens } = selectContext(query);
            log.info(`Intent: ${intent} — ${cachedRepoCount} repos (~${contextTokens} tokens)`);

            const messages = [
                ...history,
                { role: 'user', content: query },
            ];
            log.info(`Sending ${messages.length} message(s) to Claude`);

            log.info('Calling Claude claude-sonnet-4-6...');
            const response = await client.messages.create({
                model: 'claude-sonnet-4-6',
                max_tokens: 1024,
                system: SYSTEM_PROMPT + `\n\n---\nKNOWLEDGE BASE:\n${context}`,
                messages,
            });

            const rawText = response.content[0]?.text ?? '';
            const elapsed = Date.now() - startTime;
            const usage = response.usage;

            let result;
            try {
                result = JSON.parse(rawText);
            } catch {
                log.warn('Claude returned non-JSON — wrapping in TextResponse');
                result = { component: 'TextResponse', props: { text: rawText } };
            }

            log.monitor({
                query,
                historyTurns:  history.length,
                intent,
                inputTokens:   usage.input_tokens,
                outputTokens:  usage.output_tokens,
                elapsedMs:     elapsed,
                component:     result.component,
                propsKeys:     Object.keys(result.props || {}).join(', '),
                rawOutput:     rawText,
            });

            sendJSON(res, 200, result);

        } catch (err) {
            stats.errors++;
            const elapsed = Date.now() - startTime;
            log.error(`Failed after ${elapsed}ms`);
            log.error(`Type: ${err.constructor.name}`);
            log.error(`Message: ${err.message}`);

            // Anthropic API errors have extra fields
            if (err.status) log.error(`Status: ${err.status}`);
            if (err.error)  log.error(`API error:`, JSON.stringify(err.error));

            console.error(err.stack);

            sendJSON(res, 500, {
                component: 'TextResponse',
                props: { text: `Error: ${err.message}` },
            });
        }
    });
});


server.listen(PORT, () => {
    log.divider();
    console.log(`\n${colors.bold}${colors.green}  Chat API Server${colors.reset}`);
    log.divider();
    log.success(`Running at http://localhost:${PORT}/api/chat`);
    log.info(`API key: ${process.env.ANTHROPIC_API_KEY ? '✓ loaded' : '✗ MISSING — set ANTHROPIC_API_KEY in .env'}`);
    log.info(`Model: claude-sonnet-4-6`);
    log.info(`README limit: ${README_LIMIT} chars/repo`);

    const ok = loadKnowledgeCache();
    if (!ok) log.warn('knowledge.json not found — add data/knowledge.json');

    log.divider();
    console.log();
});
