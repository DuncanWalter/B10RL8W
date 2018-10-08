# B10RL8W

Central impl repository for our 8-week Reinforcement Learning project. Our
focus is teaching a computer to play Hearts using reinforcement learning.
As a side quest, we also hope to infuse ML with solid engineering practices
and smooth devex tooling.

# Contribution Guidelines

- Make issues before starting work
- Do not merge to master without a PR
- Squash commits when merging PRs
- Prefer `rebase`

# Getting Started

- If on Ubuntu, check the Ubuntu instructions below
- Assert you have node installed
- In the repository, fetch dependencies. Could take a few minutes.

```
npm install
```

- Run tests

```
npm run test
```

- Run the application

```
npm run dev
```

- Navigate to the printed localhost url printed in a browser

# Anatomy of a JavaScript ML Project

This architecture is likely unfamiliar because it does not follow standard web-dev nor machine learning practices; it is a hybrid.

All JavaScript projects have a manifest file called `package.json` at the project root which describes all the dependencies and scripts defined within the project. Nearly all the code of our project is written in TypeScript, which is a widely used variant of JavaScript with robust, optional static type analysis. The code is not all run by the same process. There are 3 major runtimes in out project: the logging server, the frontend, and the worker processes.

The logging server is used to automatically save trained agents and training progress to disk so that work can be recovered or continued later in case of interruptions. The server is written using `koa` and runs in a `node` process.

The frontend allows 'users' to configure agents, train agents, and view live results of agent training. The frontend is written using `react` and runs in a browser main process.

The worker processes(es) do the heavy lifting. They simulate games, perform training, evaluate agent performance, send snapshots to the logging server, and populate frontend graphs. These are hand-rolled, and run only code written by us. Multiple worker processes can be run at once to take advantage of parallel processing.

# Potential Future Games to Try

Our architecture could support several games if we ever decide to return to the project. Candidates include:

- Hive (perhaps simplified)
- Nested Tic-Tac-Toe
- Spades
- etc.

# Ubuntu

Parcel is sometimes annoying.
Run the following command to allow parcel to watch for file changes in `node_modules`,
which it for some reason insists on doing despite everything.

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

For reference, the default number of user watches on Ubuntu 18.04 is 8192.

# Mac

Should just work out of the box

# Windows

Untested, but should also work out of the box.
