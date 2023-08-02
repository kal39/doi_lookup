export class Article {
    #data = {};
    #references = [];
    #citations = [];

    constructor(crData, ocData) {
        this.#data = crData;

        this.#references = ocData.reference
            .split(`;`)
            .map((reference) => reference.trim())
            .filter((reference) => reference != ``);

        this.#citations = ocData.citation
            .split(`;`)
            .map((reference) => reference.trim())
            .filter((reference) => reference != ``);
    }

    static from = async function (doi) {
        try {
            const crData = Article.#getCrData(doi);
            const ocData = Article.#getOcData(doi);
            return new Article(await crData, await ocData);
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    getTitle = function () {
        return this.#data.title[0];
    };

    getAuthors = function () {
        return this.#data.author.map(
            (author) => `${author.family}, ${author.given}`
        );
    };

    getPublisher = function () {
        return this.#data.publisher;
    };

    getSource = function () {
        return this.#data[`container-title`];
    };

    getVolume = function () {
        return this.#data.volume;
    };

    getIssue = function () {
        return this.#data.issue;
    };

    getPage = function () {
        return this.#data.page;
    };

    getYear = function () {
        return this.#data.issued[`date-parts`][0][0];
    };

    getMonth = function () {
        return this.#data.issued[`date-parts`][0][1];
    };

    getDOI = function () {
        return this.#data.DOI;
    };

    getURL = function () {
        return `https://doi.org/${this.#data.DOI}`;
    };

    getAbstract = function () {
        return this.#data.abstract;
    };

    getReferences = function () {
        return this.#references;
    };

    getCitations = function () {
        return this.#citations;
    };

    prettyString() {
        return (
            `${this.getDOI()} \n` +
            `  - url: ${this.getURL()} \n` +
            `  - title: ${this.getTitle()} \n` +
            `  - authors (${this.getAuthors().length}):\n` +
            this.getAuthors()
                .map((author) => `    - ${author}\n`)
                .join(``) +
            `  - publisher: ${this.getPublisher()} \n` +
            `  - source: ${this.getSource()} \n` +
            `  - volume: ${this.getVolume()} \n` +
            `  - issue: ${this.getIssue()} \n` +
            `  - page: ${this.getPage()} \n` +
            `  - year: ${this.getYear()} \n` +
            `  - month: ${this.getMonth()} \n` +
            `  - abstract: ${this.getAbstract()}\n` +
            `  - references (${this.getReferences().length}):\n` +
            this.getReferences()
                .map((reference) => `    - ${reference}\n`)
                .join(``) +
            `  - citations (${this.getCitations().length}):\n` +
            this.getCitations()
                .map((citation) => `    - ${citation}\n`)
                .join(``)
        );
    }

    static #getCrData = async function (doi) {
        const url = `https://api.crossref.org/works/${doi}`;

        const local = sessionStorage.getItem(url);
        if (local != null && local != "{}") return JSON.parse(local);

        const remote = await fetch(url)
            .then((data) => data.json())
            .then((data) => data.message);
        sessionStorage.setItem(url, JSON.stringify(remote));
        return remote;
    };

    static #getOcData = async function (doi) {
        const url = `https://opencitations.net/index/api/v1/metadata/${doi}`;

        const local = sessionStorage.getItem(url);
        if (local != null && local != "{}") return JSON.parse(local);

        const remote = await fetch(url)
            .then((data) => data.json())
            .then((data) => data[0]);
        sessionStorage.setItem(url, JSON.stringify(remote));
        return remote;
    };
}