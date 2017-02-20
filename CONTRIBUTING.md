This is a quick guide on contributing to Isleward

## Issues

### Creating Issues
* Use the integrated [Issue tracker](https://gitlab.com/Isleward/isleward/issues)
* Before making a new issue, make sure the same issue is not already listed in the issue tracker
* In case it is listed and you have some more info, for example on how to reproduce a bug, post a comment in the original issue
* Use the `Bug` label for bugs
* Use the `Suggestion` label for suggesting new features or content
* Use the `Modding` label for modding related issues
* Use the `Feature/Content` label for new features or content
* Do **not** use the remaining labels unless you are working on the issue (see Workflow)

### Workflow
* First create an issue that relates to your changes if there's none yet (See Creating Issues)
* Fork the Isleward project or update your fork
* Make a new branch in your fork, preferably with the issue number and a very description in the name (e.g. `666-necromancer-class`, `123-crash-fix`)
* Give the issue label a `In Development`
* Make your changes
* Before submitting a merge request, make sure to properly test your changes locally
* Submit a merge request, in the merge request message, mention the task number, as mentioned in [Automatic issue closing](https://gitlab.com/help/user/project/issues/automatic_issue_closing.md) article.
* Always merge into `isleward/staging` branch, **not** `isleward/master`
* Remove the `In Development` label from the issue and give it an `In Testing` label
* Wait for the merge request to be approved. If the merge request is denied, address the comments made in the request and submit again
* After the merge request has been approved and merged, it'll get tested again in the `Staging` branch
* When it's tested and works in `Staging`, assing a `Ready for Release` label to the issue
* After the `Staging` branch is merged into `master`, the issue should get automatically closed. If not, please close the issue.