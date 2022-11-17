# How to contribute

Thanks for showing interest and sharing your time to contribute to this project!

This guide is meant to be used as a general guideline for creating issues or
pull requests. We encourage all first-time contributors to give this a read to avoid
common mistakes and improve the quality of all contributions.

## Opening issues

Before creating a new issue make sure you use the search functionality to confirm
that a similar issue doesn't already exist. Next, make sure you properly label
the issue as per our [labels](https://github.com/trento-project/web/labels)

If you are reporting a `bug`, please share a file generated using the
`trento-support.sh` script with the following params:

```
# trento-support.sh --collect all --output file-tgz
```

and include the output in your issue. The script should remove sensitive data
automatically but please make sure you are not sharing any sensitive data of your own.

## Submitting changes

Always refer to the [docs repository](https://github.com/trento-project/docs) for coding standards and general guidelines.

### Pull Requests guideline

Reviews are hard. These few points will help us to reduce the time and effort required and allow us to merge your changes faster.

1. Only touch relevant files.
2. We have a PR template to aid you in completing the required details. Be
   sure to complete it and remove the non-relevant parts.
3. Keep PRs as small as possible. When the PR gets too big, consider splitting it into multiple parts. A PR should ideally be between 100 and 500 additions.
4. Check that the tests are passing.
5. Check that your code is not generating new warnings.
6. Check that any dependent changes have been merged and published in downstream modules
7. Commit history should be short and group changes that otherwise wouldn't
   make sense on their own.
8. Always write a clear log message for your commits. One-line messages are
   fine for small changes, but bigger changes should look like this:

   ```
   git commit -m "A brief summary of the commit

   A paragraph describing what changed and its impact."
   ```

9. Write a detailed description that gives context and explains why you are
   creating the PR.
10. If the PR adds functionality, please add some tests and documentation
    to support it.
11. Each PR needs 1 approval to be merged. Select a reviewer in particular if
    you are looking for specific feedback from someone.

### Reviewers guideline

1. Opinionated comments are welcome but don't expect them always to be
   addressed. Be ready for discussion but also open to conceding.
   To avoid scope creep, consider proposing subsequent PRs
   rather than requesting changes for the current PR you are reviewing.
2. Short, concise comments with examples are the most valuable.
