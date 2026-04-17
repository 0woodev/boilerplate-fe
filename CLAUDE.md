# CLAUDE.md — boilerplate-fe

이 레포는 **풀스택 개발자를 위한 boilerplate**의 프론트엔드 서브모듈이다.
상위 레포(`boilerplate-app`)에 BE, 인프라 스크립트, AI 협업 가이드가 함께 있다.

## 스택

- **Framework**: React 18
- **Bundler**: Vite 6
- **Hosting**: S3 + CloudFront
- **CI/CD**: GitHub Actions

## 스킬

```
/apply-new-tech  → 새 기술 도입 방법 조사·추천
```

## 자주 쓰는 명령어

```bash
npm install   # 의존성 설치
npm run dev   # 로컬 개발 서버
npm run build # 프로덕션 빌드
```

---

## 진행 현황

### Pending 작업

1. **CloudFront + S3 인프라** — Terraform 구성 + GitHub Actions CI/CD
2. **환경변수 분리** — dev/prod 별 API endpoint 설정
3. **인증 연동** — BE 인증 미들웨어 완료 후 FE 토큰 처리 연동
