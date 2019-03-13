---
bg: "spring.jpg"
layout: page
permalink: /posts/
title: "Posts"
crawlertitle: "All articles"
summary: "Posts about Development"
active: archive
---

{% for post in site.posts %}
  <article class="index-page">
    <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
    {{ post.excerpt }}
    {% if post.lastmod %}
      <span class="date">{{ post.lastmod | date: "%d-%m-%Y"  }}</span>
    {% else %}
      <span class="date">{{ post.date | date: "%d-%m-%Y"  }}</span>
    {% endif %}
  </article>
{% endfor %}
