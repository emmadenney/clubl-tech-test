const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { stringify } = require('csv-stringify');

const REPO_COMMITS_URL = 'https://api.github.com/repositories/19438/commits';

async function main() {
  try {
    const { data: commits } = await axios.get(REPO_COMMITS_URL, {
      headers: {
        'User-Agent': 'ClubL_Tech_Test',
      }
    });

    await generateAuthorsCSV(commits);
    await generateFollowersCSV(commits);
    await generateCommitsCSV(commits);

  } catch (error) {
    console.log('Error:', error.message);
    throw Error(error);
  }
}

function writeCSV(fileName, headers, data) {
  console.log(`Writing ${fileName} CSV file`);
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, fileName);
    const writableStream = fs.createWriteStream(filePath);

    stringify(data, { header: true, columns: headers })
      .pipe(writableStream)
      .on('finish', () => {
        console.log(`${fileName} written`);
        resolve();
      })
      .on('error', reject);
  });
}

async function generateAuthorsCSV(commits) {
    const authors = commits
        .map(commit => {
          const author = commit.author;
          if (!author) return null;

          const commit_id = commit.sha;
          const author_id = commit.author.id;
          const author_username = commit.author.login;
          const author_name = commit.commit.author.name;
          const author_email = commit.commit.author.email;
          const author_account_url = commit.author.html_url;
          const author_avatar_url = commit.author.avatar_url;
          return {
            commit_id, author_id, author_username, author_name, author_email, author_account_url, author_avatar_url
          };
        })
        .filter(author => author !== null);

    const columns = ['commit_id', 'author_id', 'author_username', 'author_name', 'author_email', 'author_account_url', 'author_avatar_url']
    
    try {
      await writeCSV('authors.csv', columns, authors);
    } catch (error) {
      console.log("Error writing Authors CSV file: ", error.message);
      throw Error(error);
    }
}

async function generateFollowersCSV(commits) {
  const allFollowers = [];
  const seenAuthors = new Set();

  for (const commit of commits) {
    const {author} = commit;

    if (!author || seenAuthors.has(author.id)) continue;
    seenAuthors.add(author.id);

    try {
      const { data: followers } = await axios.get(author.followers_url, {
        headers: {
          'User-Agent': 'ClubL_Tech_Test',
        }
      });

      const firstFive = followers.slice(0, 5);

      const row = {
        committer_username: author.login,
        follower1_username: firstFive[0]?.login || null,
        follower2_username: firstFive[1]?.login || null,
        follower3_username: firstFive[2]?.login || null,
        follower4_username: firstFive[3]?.login || null,
        follower5_username: firstFive[4]?.login || null
      };

      allFollowers.push(row);
    } catch (error) {
      console.warn(`Could not fetch followers for ${author.login}: ${error.message}`);
    }
  }

  const columns = ['committer_username', 'follower1_username', 'follower2_username', 'follower3_username', 'follower4_username', 'follower5_username'];
  
  try {
    await writeCSV('followers.csv', columns, allFollowers);
  } catch (error) {
    console.log("Error writing Followers CSV file: ", error.message);
    throw Error(error);
  }
}

async function generateCommitsCSV(commits) {
  const formattedCommits = [];

  for (const commit of commits) {
    try {
      const { data: comments } = await axios.get(commit.comments_url, {
        headers: {
          'User-Agent': 'ClubL_Tech_Test',
        }
      });

      const sortedComments = comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      const last_comment_url = sortedComments[sortedComments.length - 1]?.html_url || null;
      const second_last_comment_url = sortedComments[sortedComments.length - 2]?.html_url || null;

      const repo_url_array = commit.html_url.split('/');
      const repo_url = repo_url_array.slice(0, repo_url_array.length - 2).join("/");

      formattedCommits.push({
        repo_url,
        last_comment_url,
        second_last_comment_url,
      });
    } catch (error) {
      console.log(`Could not fetch comments for ${commit.sha}: ${error.message}`);
      throw Error(error);
    }
  }

  const columns = ['repo_url', 'last_comment_url', 'second_last_comment_url'];

  try {
    await writeCSV('commits.csv', columns, formattedCommits);
  } catch (error) {
    console.log("Error writing Commits CSV file: ", error.message);
    throw Error(error);
  }
}

main();
