export const REPO = 'seogineer/rescene-sponsors';
export const BRANCH = 'main';
export const REPO_URL = `https://github.com/${REPO}`;

/** 사이트 내부 경로를 base(/rescene-sponsors)를 붙여 만든다. */
export const url = (path = '') =>
	`${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

/** filePath는 저장소 기준 상대경로(entry.filePath). 파일명이 id로 바뀌어도 실제 파일을 가리킨다. */
export const editUrl = (filePath: string) => `${REPO_URL}/edit/${BRANCH}/${filePath}`;

export const newIssueUrl = (template: string) =>
	`${REPO_URL}/issues/new?template=${template}`;
