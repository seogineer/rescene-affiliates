export const REPO = 'seogineer/rescene-sponsors';
export const BRANCH = 'main';
export const REPO_URL = `https://github.com/${REPO}`;

/** 사이트 내부 경로를 base(/rescene-sponsors)를 붙여 만든다. */
export const url = (path = '') =>
	`${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

export const editUrl = (id: string) =>
	`${REPO_URL}/edit/${BRANCH}/src/content/sponsors/${id}.yaml`;

export const newIssueUrl = (template: string) =>
	`${REPO_URL}/issues/new?template=${template}`;
