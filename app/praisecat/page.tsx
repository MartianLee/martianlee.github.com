import { Authors, allAuthors } from '.contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'
import React from 'react'
import Link from '@/components/Link'

export const metadata = genPageMetadata({ title: 'About' })

export default function Page() {
  const author = allAuthors.find((p) => p.slug === 'default') as Authors
  const mainContent = coreContent(author)

  return (
    <>
      <AuthorLayout content={mainContent}>
        <h1>칭찬할고양 개발자 페이지</h1>
        <h2>개발자명</h2>
        <p>martianlee</p>
        <h2>계정 삭제 요청</h2>
        <p>martionlee@gmail.com 으로 요청</p>
        <h2>삭제되거나 보관되는 데이터 유형 및 추가 보관 기간</h2>
        <p>직전 로그인 후 90일 이내</p>
        <h2>개인정보처리방침</h2>
        <p>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://sites.google.com/view/praisecat-privacy/"
          >
            링크에서 확인하기
          </Link>
        </p>
      </AuthorLayout>
    </>
  )
}
