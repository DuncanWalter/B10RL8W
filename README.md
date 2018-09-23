# B10RL8W

Central impl repository for our RL project. Our project teaches a computer to play Hearts using reinforcement learning and a fair bit of trickery.

# TODO

- determine technologies
- determine project
- do the project

Only 3 steps to go, so I'd say we're off to a good start!

# Contribution Guidelines

- Be one of the project collaborators (we are easily startled by strangers)
- Do not merge to master without a PR (though you may approve your own PR- UGJ)
- Squash commits when merging PRs
- Resolve conflicts with `rebase` (not `merge`- @DuncanWalter can answer questions)

# Getting Started

- Assert you have node installed

```
node "console.log('Hello World!')"
```

- In the repository, fetch dependencies with:

```
npm install
```

- To run tests

```
npm run test
```

- To run the application

```
npm run start-dev
```

# Potential other games to play for fun

- Nested Tic-Tac-Toe
- Hive (perhaps simplified)
- ???

# Linux

Parcel is PO\* so if you're on Linux, run the following command to allow parcel to watch for file changes in `node_modules`

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

For reference, the default number of user watches on Ubuntu 18.04 is 8192.

# Mac

Should just work out of the box?

# Windows

I'm not supporting that unless we really need to for GPU support.
