// 영상만 있으면 '영상', 이미지(기사 사진 링크 등)가 섞이면 '이미지·영상'이라고 부른다. import하지 않아 node로 테스트할 수 있다.
export function mediaNoun(media: { kind: 'image' | 'video' }[]): '영상' | '이미지·영상' {
	return media.length > 0 && media.every((m) => m.kind === 'video') ? '영상' : '이미지·영상';
}
