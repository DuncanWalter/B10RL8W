/**
 * Our application is computationally intensive, so we will be running agent
 * training and evaluations off of the main rendering thread using web-workers,
 * which are equivalent to forked processes. Processes in JS cannot truly share
 * memory, so there is some boilerplate and protocol involved in setting up
 * the web-worker processes and bossing them around.
 */

export { trainAgent, evaluateAgents } from './service'
