const path = require('path');
// const utils = require(`~/src/utils`);

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;

  const { data } = await graphql(`
    query Posts {
      allMdx(sort: { fields: frontmatter___date, order: DESC }) {
        nodes {
          slug
          frontmatter {
            title
            author
            categories
            crawlertitle
            date
            layout
            summary
            tags
          }
        }
      }
    }
  `);
  const posts = data.allMdx.nodes;
  posts.forEach(async (node, index) => {
    const pagetitle = node.slug?.split('-').splice(3).join('-');
    createPage({
      path: `/posts/${pagetitle}`,
      component: path.resolve('./src/templates/post-details.tsx'),
      context: {
        title: node.frontmatter.title,
        prev: index == 0 ? null : posts[index - 1],
        next: index == posts.length - 1 ? null : posts[index + 1],
      },
    });
  });
};
