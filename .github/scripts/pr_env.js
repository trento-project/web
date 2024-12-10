module.exports = (github, context) => {
  const MARKER = "<!-- pr-env-bot -->";
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const pullRequestNumber = context.issue.number;

  console.log(
    `Executing script with 
  owner: ${owner}
  repo: ${repo}
  pullRequestNumber: ${pullRequestNumber}`
  );

  function createCommentBody(domain) {
    const url = `${pullRequestNumber}.${domain}`;
    return `${MARKER}\n\nThe preview environment for this pull request is ready at [${url}](https://${url}).`;
  }

  async function addComment(commentBody) {
    try {
      const response = await github.rest.issues.createComment({
        owner,
        repo,
        issue_number: pullRequestNumber,
        body: commentBody,
      });

      console.log("Comment created successfully:", response.data.html_url);
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  async function removeComment(commentId) {
    try {
      await github.rest.issues.deleteComment({
        owner,
        repo,
        comment_id: commentId,
      });

      console.log("Comment deleted successfully:", commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }

  async function findCommentByContent(regex) {
    try {
      let page = 1;
      const per_page = 100;
      while (true) {
        console.log("Fetching comments page:", page);
        const comments = await github.rest.issues.listComments({
          owner,
          repo,
          issue_number: pullRequestNumber,
          per_page,
          page,
        });

        const found = comments.data.find((comment) => regex.test(comment.body));
        if (found) {
          return found;
        } else if (comments.data.length < Math.min(per_page, 100)) {
          return undefined;
        } else {
          page++;
        }
      }
    } catch (error) {
      console.error("Error finding comment:", error);
      throw error;
    }
  }

  return {
    async onPrEnvCreated(fqdn) {
      const comment = await findCommentByContent(new RegExp(MARKER));
      if (comment) {
        console.log("Comment already exists:", comment.html_url);
        return;
      }
      const body = createCommentBody(fqdn);
      await addComment(body);
    },

    async onPrEnvClosed() {
      const comment = await findCommentByContent(new RegExp(MARKER));
      if (comment) {
        await removeComment(comment.id);
      }
    },
  };
};
