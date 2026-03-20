variable "project_name" {
  description = "프로젝트 이름"
  type        = string
}

variable "stage" {
  description = "배포 환경 (dev / prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS 리전"
  type        = string
}

variable "domain" {
  description = "루트 도메인 (Route53 Hosted Zone). ex) wooapps.net"
  type        = string
}

variable "fe_subdomain" {
  description = "FE 서브도메인. ex) myapp.wooapps.net (https:// 없이)"
  type        = string
}
