# ClubL Tech Test

This Node.js script fetches and processes Github commit data from a public GitHub repository, and writes the results to three CSV files:
   - `authors.csv`: Commit author basic details (id, username, name, email, avatar URL, github URL)
   - `followers.csv`: The first 5 followers (username) of each committer
   - `commits.csv`: Per commit, the repo URL and last two comment URLs (if available)

---

## Tech Stack

- Node.js
- Axios (for HTTP requests)
- csv-stringify (for CSV file generation)
- fs / path (for writing to file system)

---

## Setup Instructions

1. Clone this repo (or download the files)

2. Install dependencies:

   npm install

3. Run script:

   node index.js

---

## Output

After running, three CSV files will be created in the project directory:

- authors.csv
- followers.csv
- commits.csv

---

## Notes and Assumptions

1. None of the commits for the repo seem to have any comments as the comments_url for each returns an empty array, therefore the 'commits.csv' file has empty fields for 'last_comment_url' and 'second_last_comment_url' columns. The returned json data from fetching comments is assumed to have 'html_url' and 'created_at' properties as per the Github API documentation (https://docs.github.com/en/rest/commits/comments?apiVersion=2022-11-28#list-commit-comments-for-a-repository).

2. The 'followers.csv' file is being generated under the assumption that it is useful to see which committer the five followers are associated with, and also that only the follower's username is required. If more details are required per follower, this data could be included within the same field as part of an object instead of a single string value and the column header changed to 'follower1' for example - or - if the committer info is not required, each follower's details could be separated into columns similar to the 'authors.csv' file.