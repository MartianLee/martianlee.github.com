---
bg: "spring.jpg"
layout: page
permalink: /question/
title: "Questions"
crawlertitle: "Questions"
summary: "Archive Daily Question"
active: archive
---

{% for post in site.posts %}
  {% if post.tags contains "question" %}
  <article class="index-page">
    <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
    {{ post.excerpt }}
    {% if post.lastmod %}
      <span class="date">{{ post.lastmod | date: "%d-%m-%Y"  }}</span>
    {% else %}
      <span class="date">{{ post.date | date: "%d-%m-%Y"  }}</span>
    {% endif %}
  </article>
  {% endif %}
{% endfor %}
