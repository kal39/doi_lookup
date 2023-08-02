import { Article } from "./article.js";

/*
    10.1016/j.imavis.2005.02.004
*/
const doiSearchField = document.getElementById(`doi-search-field`);
const doiSearchButton = document.getElementById(`doi-search-button`);

const msgSection = document.getElementById(`msg-section`);

const articleInfoSection = document.getElementById(`article-info-section`);
const articleInfoTitle = document.getElementById(`article-info-title`);
const articleInfoAuthor = document.getElementById(`article-info-author`);

const articleStatCitation = document.getElementById(`article-stat-cit`);
const articleStatReference = document.getElementById(`article-stat-ref`);

let currentArticle = undefined;

const createSpinner = function (size) {
    const spinner = document.createElement(`div`);
    spinner.classList.add(`spinner`);
    spinner.style.width = size;
    spinner.style.height = size;
    return spinner;
};

const createArticleStatListItem = function (doi, parent) {
    const a = document.createElement(`a`);
    a.href = `${window.location.href.split(`?`)[0]}?doi=${doi}`;
    a.appendChild(createSpinner(`12px`));
    a.appendChild(document.createTextNode(`${doi}`));

    const div = document.createElement(`div`);
    div.classList.add(`article-stat-list-item`);
    div.appendChild(a);

    parent.appendChild(div);

    Article.from(doi).then((article) => {
        a.innerHTML = article.getTitle();
    });
};

const showArticleCurrent = function () {
    if (currentArticle === undefined) {
        console.log(`article undefined`);
        return;
    }

    articleInfoTitle.innerHTML = `${currentArticle.getTitle()}`;
    articleInfoAuthor.innerHTML = `${currentArticle.getAuthors().join(`  `)}`;

    while (articleStatCitation.firstChild) {
        articleStatCitation.removeChild(articleStatCitation.firstChild);
    }

    while (articleStatReference.firstChild) {
        articleStatReference.removeChild(articleStatReference.firstChild);
    }

    currentArticle
        .getCitations()
        .map((doi) => createArticleStatListItem(doi, articleStatCitation));

    currentArticle
        .getReferences()
        .map((doi) => createArticleStatListItem(doi, articleStatReference));

    articleInfoSection.style.display = `block`;
    msgSection.style.display = `none`;
};

const showArticleSearching = function () {
    while (msgSection.firstChild) msgSection.removeChild(msgSection.firstChild);
    msgSection.appendChild(createSpinner(`20px`));

    articleInfoSection.style.display = `none`;
    msgSection.style.display = `block`;
};

const showArticleNotFound = function () {
    while (msgSection.firstChild) msgSection.removeChild(msgSection.firstChild);
    msgSection.innerHTML = `article not found`;

    articleInfoSection.style.display = `none`;
    msgSection.style.display = `block`;
};

const showArticleNone = function () {
    articleInfoSection.style.display = `none`;
    msgSection.style.display = `none`;
};

const search = async function (doi) {
    showArticleSearching();
    currentArticle = await Article.from(doi);

    if (currentArticle) {
        showArticleCurrent();
    } else {
        showArticleNotFound();
    }

    // window.location.search = doi;
    window.history.replaceState(
        {},
        ``,
        `${window.location.href.split(`?`)[0]}?doi=${doi}`
    );
};

doiSearchField.addEventListener(`keypress`, function (event) {
    if (event.key === `Enter`) {
        doiSearchButton.click();
    }
});

doiSearchButton.addEventListener(`click`, async function (event) {
    search(doiSearchField.value.trim());
});

window.onload = function () {
    showArticleNone();

    const urlParams = new URLSearchParams(window.location.search);
    const doi = urlParams.get(`doi`);
    if (doi != null) {
        doiSearchField.value = doi;
        doiSearchButton.click();
    }
};
