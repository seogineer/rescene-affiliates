import { execFileSync } from 'node:child_process';

export type Change = { date: string; subject: string; hash: string };

/** 배포 시점의 git 기록에서 변경 내역을 만든다. 기록을 못 읽으면(얕은 clone 등) 빈 목록. */
export function getChanges(limit = 100): Change[] {
	try {
		const out = execFileSync('git', ['log', `-${limit}`, '--date=format-local:%Y-%m-%d', '--format=%cd%x1f%h%x1f%s'], {
			encoding: 'utf8',
			env: { ...process.env, TZ: 'Asia/Seoul' },
		});
		return out
			.split('\n')
			.filter(Boolean)
			.map((line) => {
				const [date, hash, subject] = line.split('\x1f');
				return { date, hash, subject };
			});
	} catch {
		return [];
	}
}
