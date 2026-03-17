# boilerplate-fe

Frontend boilerplate. [boilerplate-app](https://github.com/0woodev/boilerplate-app)의 `setup.sh`에 의해 새 프로젝트의 `fe/` submodule로 복제된다.

## 사용 방법

직접 클론하지 않고, `boilerplate-app`의 `setup.sh`를 통해 사용한다.

```
boilerplate-fe (클론) → {app_name}-fe (새 레포) → main repo의 fe/ submodule
```

## 플레이스홀더

`setup.sh` 실행 시 아래 값들이 자동으로 치환된다.

| 플레이스홀더 | 치환값 |
|---|---|
| `{{PROJECT_NAME}}` | 프로젝트 이름 |
| `{{FE_DOMAIN}}` | `{app_name}.{domain}` |
| `{{GITHUB_OWNER}}` | GitHub 유저/org명 |

## 현재 구조

```
fe/
├── src/        ← FE 소스 (미정)
└── README.md
```

## 히스토리

- 초기 설계: FE 배포 방식 미정 (Amplify 경험 있음)
- 비용 최적화 방향: CloudFront + S3 + ACM + Route53 결정
- 도메인: `{app_name}.0woodev.com`

## 앞으로 할 것

- [ ] FE 프레임워크 선택 및 기본 구조 세팅
- [ ] Terraform 인프라 코드 (S3, CloudFront, ACM, Route53)
- [ ] GitHub Actions 배포 workflow
