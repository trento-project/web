# How to contribute

Thanks for showing interest and sharing your time to contribute to this project!

This guide is meant to be used as general guideline creating issues or
pull requests. We encourage all first contributors to give this a read to avoid
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
and include the output to your issue. The script should remove sensitive data
automatically but please make sure you are not sharing anything sensible yourself.

## Submitting changes

### Pull Requests guideline

Reviews are hard. This few points will help reduce the effort and allow us to
merge your changes faster.

1. Only touch relevant files.
2. We have a PR template to aid you in completing the required details. Be 
   sure to complete it and remove the non-relevant parts.
4. Keep PRs as small as possible. When the PR gets too big, consider splitting
   it in multiple parts. An PR should ideally be between 100 and 500 additions.
5. Check that the tests are passing.
6. Commit history should be short and group changes that otherwise wouldn't
   make sense on their own.
7. Always write a clear log message for your commits. One-line messages are 
   fine for small changes, but bigger changes should look like this:

    ```
    git commit -m "A brief summary of the commit
    
    A paragraph describing what changed and its impact."
    ```
8. Write a detailed description that gives context and explains why you are
   creating the PR.
9. If the PR adds functionality, please add some documentation to support it.
10. Each PR needs 1 approval to be merged. Select a reviewer in particular if
   you are looking for specific feedback from someone.

### Reviewers guideline
1. Opinionated comments are welcome but don't expect them always to be 
   addressed. Be ready for discussion but also open to concede.
2. In order to avoid scope creeping, consider to propose subsequent PRs 
   rather than requesting changes for the current PR you are reviewing.
3. Short, concise comments with examples are the most valuable.