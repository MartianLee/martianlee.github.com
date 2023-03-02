const path = require('path');
// const utils = require(`~/src/utils`);

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;

  const { data } = await graphql(`
    query Posts {
      allMdx(sort: { frontmatter: { date: DESC } }) {
        nodes {
          frontmatter {
            title
            slug
            author
            categories
            crawlertitle
            date
            layout
            summary
            tags
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `);
  const posts = data?.allMdx.nodes;

  // createPage({
  //   path: `/my-sweet-new-page/`,
  //   component: path.resolve(`./src/templates/my-sweet-new-page.js`),
  //   ownerNodeId: `123456`,
  //   // The context is passed as props to the component as well
  //   // as into the component's GraphQL query.
  //   context: {
  //     id: `123456`,
  //   },
  // })

  posts?.forEach(async (node, index) => {
    const pagetitle = node.frontmatter.slug?.split('-').splice(3).join('-');
    const postTemplate = path.resolve('./src/templates/post-details.tsx');
    createPage({
      path: `/posts/${pagetitle}`,
      component: `${postTemplate}?__contentFilePath=${node.internal.contentFilePath}`,
      context: {
        ...node.frontmatter,
        title: node.frontmatter.title,
        prev: index == 0 ? null : posts[index - 1],
        next: index == posts.length - 1 ? null : posts[index + 1],
      },
    });
  });
};
