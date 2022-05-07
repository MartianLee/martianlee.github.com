import { graphql, Link, useStaticQuery } from 'gatsby';
import React from 'react';

function Navbar() {
  const data = useStaticQuery(graphql`
    query SiteInfo {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);
  const { title } = data.site.siteMetadata;
  return (
    <nav>
      <h1>
        <Link to="/">{title}</Link>
        <Link to="/about">About</Link>
        <Link to="/posts">Posts</Link>
      </h1>
    </nav>
  );
}

export default Navbar;
