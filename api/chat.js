const Anthropic = require('@anthropic-ai/sdk');
const fs        = require('fs');
const path      = require('path');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const README_LIMIT = 800;
const SKIP_REPOS   = [
    'portfolio-data', 'React-Documentation', 'github-slideshow',
    'random_generator', 'top-of-my-head', 'skills-integrate-mcp-with-copilot',
    'Brighten-Up', 'SajuLoom', 'zero2-bot', 'GlanceAt',
    'attendence_system', 'Custom-Flutter-UI',
];

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
{ "component": "ProjectCard", "props": { "title": "string", "description": "string", "stack": ["string"], "highlight": "string (optional)", "url": "string (optional)" } }

ProjectList — multiple projects overview
{ "component": "ProjectList", "props": { "intro": "string", "projects": [{ "name": "string", "one_line": "string", "stack": ["string"] }] } }

SkillList — skills and expertise
{ "component": "SkillList", "props": { "intro": "string", "skills": [{ "name": "string", "level": "strong | familiar", "context": "string" }] } }

AboutCard — who I am, background
{ "component": "AboutCard", "props": { "summary": "string", "highlights": ["string"] } }

Timeline — career history
{ "component": "Timeline", "props": { "entries": [{ "period": "string", "title": "string", "detail": "string" }] } }

ContactCard — availability, how to reach me
{ "component": "ContactCard", "props": { "message": "string", "email": "string", "availability": "string" } }

TextResponse — fallback
{ "component": "TextResponse", "props": { "text": "string" } }

Respond ONLY with the JSON object. No markdown, no explanation, no extra text.
`;

// ─── Knowledge formatter ──────────────────────────────────────────────────────

function buildKnowledgeSlices(knowledge) {
    let fullContext  = '';
    let personalInfo = '';
    let briefRepoList = 'PROJECTS & REPOS (overview):\n';
    const repoContextMap = {};

    if (knowledge.portfolio && Object.keys(knowledge.portfolio).length > 0) {
        personalInfo = `PERSONAL INFO:\n${JSON.stringify(knowledge.portfolio, null, 2)}\n\n`;
        fullContext  += personalInfo;
    }

    fullContext += 'PROJECTS & REPOS:\n';

    for (const repo of knowledge.repos) {
        if (SKIP_REPOS.includes(repo.name)) continue;
        if (!repo.description && !repo.readme) continue;

        // Full entry
        let entry = `\n## ${repo.name}\n`;
        if (repo.description) entry += `Description: ${repo.description}\n`;
        if (repo.topics?.length) entry += `Topics: ${repo.topics.join(', ')}\n`;
        entry += `URL: ${repo.url}\n`;
        if (repo.readme) {
            entry += `README:\n${repo.readme.slice(0, README_LIMIT)}${repo.readme.length > README_LIMIT ? '\n[...truncated]' : ''}\n`;
        }
        entry += '\n';

        fullContext += entry;
        repoContextMap[repo.name] = entry;

        // Brief entry (name + description only)
        briefRepoList += `\n## ${repo.name}\n`;
        if (repo.description) briefRepoList += `Description: ${repo.description}\n`;
        if (repo.topics?.length) briefRepoList += `Topics: ${repo.topics.join(', ')}\n`;
        briefRepoList += `URL: ${repo.url}\n`;
    }

    return { fullContext, personalInfo, briefRepoList, repoContextMap };
}

// ─── Intent classification ────────────────────────────────────────────────────

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

function findMatchingRepo(query, repoContextMap) {
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

function selectContext(query, slices) {
    const { fullContext, personalInfo, briefRepoList, repoContextMap } = slices;
    const intent = classifyIntent(query);

    // Specific repo match
    const matchedRepo = findMatchingRepo(query, repoContextMap);
    if (matchedRepo) {
        return { context: personalInfo + 'PROJECTS & REPOS:\n' + repoContextMap[matchedRepo], intent: `SPECIFIC(${matchedRepo})` };
    }

    if (['ABOUT', 'CONTACT', 'LOCATION', 'EDUCATION', 'EXPERIENCE'].includes(intent)) {
        return { context: personalInfo, intent };
    }

    if (['SKILLS', 'SKILL_EXPERIENCE'].includes(intent)) {
        return { context: personalInfo + briefRepoList, intent };
    }

    return { context: fullContext, intent: intent === 'UNKNOWN' ? 'FULL(fallback)' : intent };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.status(204).end(); return; }
    if (req.method !== 'POST')    { res.status(405).json({ error: 'Method not allowed' }); return; }

    try {
        const { query, history = [] } = req.body;

        if (!query) {
            return res.status(400).json({ component: 'TextResponse', props: { text: 'No query provided.' } });
        }

        const filePath = path.join(process.cwd(), 'data', 'knowledge.json');
        if (!fs.existsSync(filePath)) {
            return res.status(200).json({ component: 'TextResponse', props: { text: 'Knowledge base not found.' } });
        }

        const knowledge = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const slices    = buildKnowledgeSlices(knowledge);
        const { context, intent } = selectContext(query, slices);

        console.log(`Intent: ${intent} — ~${Math.round(context.length / 4)} tokens`);

        const messages = [...history, { role: 'user', content: query }];

        const response = await client.messages.create({
            model:      'claude-sonnet-4-6',
            max_tokens: 1024,
            system:     SYSTEM_PROMPT + `\n\n---\nKNOWLEDGE BASE:\n${context}`,
            messages,
        });

        const rawText = response.content[0]?.text ?? '';

        try {
            res.status(200).json(JSON.parse(rawText));
        } catch {
            res.status(200).json({ component: 'TextResponse', props: { text: rawText } });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ component: 'TextResponse', props: { text: 'Something went wrong.' } });
    }
};
