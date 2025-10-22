import type {PollerChannel} from "@/services/poller/channels/channel";
import {toQueryStr} from "@/helpers";
import {isArray, isNonEmptyString, isNumber, isObject, isStringArray} from "@/helpers/guards";
import {insertArticle} from "@/services/db";
import axios from "axios";
import {type ISO8601Extended, toISO8601Extended} from "@/helpers/date";

const RESOURCE_ID = "EU_PMC"
const BASE_URL = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";

type EuropePmcArticle = {
    id: string,
    source: string,
    authorString?: string,
    fullTextIdList?: {
        fullTextId: string[]
    }
    title: string
    pubType: string
    firstPublicationDate: string
}

type EuropePmcResp = {
    hitCount: number,
    nextPageUrl?: string,
    resultList: {
        result: EuropePmcArticle[]
    }
}

const isEuropePmcArticle = (article: unknown): article is EuropePmcArticle => {
    if (!isObject(article)) return false;

    if (article.authorString !== undefined && typeof article.authorString !== "string") return false;
    return (
        isNonEmptyString(article.id) &&
        isNonEmptyString(article.source) &&
        isNonEmptyString(article.title) &&
        isNonEmptyString(article.pubType) &&
        isNonEmptyString(article.firstPublicationDate) &&
        (article.fullTextIdList === undefined || isObject(article.fullTextIdList)) &&
        (article.fullTextIdList ? isStringArray(article.fullTextIdList.fullTextId) : true)
    );
};

export function isEuropePmcResp(resp: unknown): resp is EuropePmcResp {
    if (!isObject(resp)) return false;
    if (!isNumber(resp.hitCount)) return false;
    if (resp.nextPageUrl !== undefined && typeof resp.nextPageUrl !== "string") return false;

    if (!isObject(resp.resultList)) return false;
    const rl = resp.resultList as Record<string, unknown>;
    return isArray(rl.result, isEuropePmcArticle);
}

function buildRequestUrl(query: string, interval: [ISO8601Extended, ISO8601Extended], limit?: number) {
    return `${BASE_URL}?${
        toQueryStr({
            query: query.trim() + ` AND OPEN_ACCESS:y AND FIRST_PDATE:[${interval[0]} TO ${interval[1]}]`,
            cursorMark: "*",
            synonym: "false",
            format: "json",
            pageSize: limit ? limit.toString() : "100"
        })
    }`;
}

async function handleResponse(resp: unknown, therapyId: number, limit?: number) {
    if (!isEuropePmcResp(resp)) {
        console.log("Broken data")
        return
    }
    for (const article of resp.resultList.result) {
        if (!article.fullTextIdList) continue;
        await insertArticle(
            `${RESOURCE_ID}/${article.source}/${article.id}`,
            RESOURCE_ID,
            article.title,
            `https://europepmc.org/article/${article.source}/${article.id}`,
            article.firstPublicationDate,
            article.authorString,
            `https://www.ebi.ac.uk/europepmc/webservices/rest/${article.fullTextIdList.fullTextId[0]}/fullTextXML`,
            therapyId
        );
    }

    // TODO multi-request with limit
    // For now buildRequestUrl forces EPMC to return `limit` of articles in 1 response.
    if(resp.nextPageUrl && !limit) {
        const nextResp = await axios.get(resp.nextPageUrl)
        if (nextResp.status !== 200) {
            console.error(`request to ${resp.nextPageUrl} failed with status code ${nextResp.status}`);
        }
        console.log(`${RESOURCE_ID} - NEXT PAGE`);
        await handleResponse(nextResp.data, therapyId);
    } else {
        console.log(`${RESOURCE_ID} - ${therapyId} - DONE`);
    }
}

export function europePmcChannel(
    therapyId: number,
    query: string,
    opts? : {
        limit?: number,
        forceInterval?: [ISO8601Extended, ISO8601Extended]
    }
): PollerChannel {
    const dayBefore = new Date();
    const yesterdayUTC = new Date();
    dayBefore.setUTCDate(dayBefore.getUTCDate() - 2);
    yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);

    return {
        title: `Europe PMC / ${query.trim()}`,
        url: buildRequestUrl(
            query,
            opts?.forceInterval || [toISO8601Extended(dayBefore), toISO8601Extended(yesterdayUTC)],
            opts?.limit
        ),
        responseHandler: ((resp: unknown) => handleResponse(resp, therapyId, opts?.limit))
    }
}