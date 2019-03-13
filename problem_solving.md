---
bg: "spring.jpg"
layout: page
permalink: /ps/
title: "Problem Solving"
crawlertitle: "Problem Solving with Algorithm"
summary: "Posts about Problem Solving"
active: archive
---

{% for post in site.posts %}
  {% if post.tags contains "algorithm" %}
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