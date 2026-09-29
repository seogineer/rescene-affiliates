# 리센느 계열사

> 리센느와 함께한 기업 위키

리센느와 함께한 기업, 그리고 기업이 공개한 이미지·영상 링크를 팬들이 함께 기록하는 **비공식 팬 사이트**입니다.
'계열사'는 소속사의 계열사가 아니라 리센느와 함께한 기업을 부르는 팬들의 애칭입니다.

**🔗 https://seogineer.github.io/rescene-affiliates/**

## 함께 만들기
누구나 고치거나 추가할 수 있어요. GitHub 계정이 필요합니다.

| 하고 싶은 일 | 방법 |
|---|---|
| 잘못된 내용 고치기 | 사이트의 **✏️ 이 문서 편집**을 눌러 수정 후 PR |
| 새 기업 추가하기 | `src/content/sponsors/` 에 파일 추가 후 PR |
| 파일이 부담스럽다면 | [기업 제보](../../issues/new?template=new-sponsor.yml) · [이미지·영상 제보](../../issues/new?template=add-media.yml) |
| 삭제·정정 요청 | [정정·삭제 요청](../../issues/new?template=correction.yml) |

자세한 규칙은 [CONTRIBUTING.md](CONTRIBUTING.md)를 봐주세요. 핵심은 세 가지예요.
1. **출처 링크 필수** — 근거 없는 내용은 받지 않습니다.
2. **이미지·영상은 원본 게시물 링크로만** — 파일을 저장소에 올리지 않습니다.
3. **확인하지 못한 것은 `확인필요`** — 추측하지 않습니다.

## 기술
[Astro](https://astro.build) 콘텐츠 컬렉션 + GitHub Pages. 기업 한 곳이 YAML 파일 하나이고, 형식은 `src/content.config.ts`의 스키마로 검사합니다.
PR을 올리면 스키마 검사와 빌드가 자동으로 돌고, `main`에 합쳐지면 자동 배포됩니다.

```sh
npm install
npm run dev      # http://localhost:4321/rescene-affiliates/
npm run build
```

## 라이선스와 저작권
코드는 [MIT 라이선스](LICENSE)입니다. 기업 문서(`src/content/sponsors/`)는 기사 등 공개 자료를 정리한 것이며, 각 출처의 저작권은 원저작자에게 있습니다.

소속사·기업과 무관한 팬 사이트입니다. 사진·영상은 공식 채널과 원본 게시물에서 불러오며, 저작권은 각 권리자에게 있습니다.
삭제 요청은 [이슈](../../issues/new?template=correction.yml)로 남겨주시면 확인 후 반영합니다.
