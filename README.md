# B10RL8W

Central impl repository for our 8-week Reinforcement Learning project. Our
focus is teaching a computer to play Hearts using reinforcement learning.

# Where things are

many `index.ts` files contain comments explaining the content of the directory.

Agents of all varieties (random, contextless, rule-tracking, contextual, heuristic, and co.) are located in `src/agents` along with training and evaluation code. The test files demonstrate how to use all the code and directly import all the relevant code. Note the `createAgent`, `gameSummary`, and `learningMethods` modules in particular- they contain the code for leaning methods and feature constructions.

The simulator is located in `src/simulator`. Reading the tests is probably the quickest way to get a handle on what's going on there if you're curious.

The neural nets are conspicuously located in `src/neural-net`. Note that the neural net code has since been copied over to another repository and published on `npm` as the package `combobulate`.
