---
layout: post
title:  "Django 프로젝트를 생성하고 Google App Engine에 배포하기 1"
crawlertitle: "Django 프로젝트를 생성하고 Google App Engine에 배포하기 1"
summary: "Django 프로젝트를 생성하고 Google App Engine에 배포하는 방법을 알아봅니다."
date: 2020-02-09 22:18:49 +0900
categories: posts
tags: ['develop','django', 'GCP']
author: MartianLee
output:
  html_document:
    toc: true
---

![img]({{ site.images }}/20200209/django.png)

* 목차
{:toc}

## 목표
장고Django 프로젝트를 생성하고 Google Appe Engine에 배포해 봅니다.

개발환경
* Python 3.7.4
* Django 3.0
* Gooogle Cloud Platform SDK

## 해결과정

회사에서 어플리케이션 배포를 위해 Google Cloud Platform을 입문했다. Amazon의 Elastic Beans Talk와 비슷하다고 하는데, 나는 Elastic Beans Talk보다 GAE(Google App Engine)을 먼저 입문해서 그런지 적응하니 상당히 편하다. 아주 간단히(?) 스케일링 가능한 웹앱을 배포할 수 있다는 점이 큰 장점이다.

### Google Cloud Platform SDK 설치

### Django App Initialze

### 데이터베이스 생성 및 연결

### 기타 설정

### 배포 스크립트 작성

## 참고자료

* [구글 클라우드 플랫폼 공식 튜토리얼](https://cloud.google.com/gcp/getting-started/?hl=ko)