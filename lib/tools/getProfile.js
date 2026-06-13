import { getKnowledge } from "../knowledge.js";

export function getProfile() {
    const {portfolio} = getKnowledge();
    return portfolio;
}
