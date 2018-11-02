import matplotlib.pyplot as plt
import json
import pandas as pd

def averageRuns(directory, learningAgentType):
  avg = pd.DataFrame(columns=['meanScore','stdDevScore','meanPerformance',
  'stdDevPerformance','epoch'])
  for i in range(1,6):
    with open(directory+"/"+learningAgentType+"_"+str(i)+".json", "r") as readFile:
      data = json.load(readFile)
      if i==1:
        avg = avg.append(data["snapshots"])
      else: 
        dataFrame = pd.DataFrame.from_dict(data["snapshots"], orient='columns')
        avg = pd.concat([avg,dataFrame])

  avg = (avg.groupby(avg.index)).mean()
  return avg

def plotMethod(directory, agentType, metric, title):
  sarsaFrame = averageRuns(directory, "sarsa_"+agentType)
  qFrame = averageRuns(directory, "qlearning_"+agentType)
  dqnFrame = averageRuns(directory, "dqn_"+agentType)

  sarsaQX = range(0, 2001, 100)
  dqnX = range(0, 10001, 100)
  sarsaY = sarsaFrame["mean"+metric]
  qY = qFrame["mean"+metric]
  dqnY = dqnFrame["mean"+metric]
  sarsaCI = sarsaFrame["stdDev"+metric]
  qCI = qFrame["stdDev"+metric]
  dqnCI = dqnFrame["stdDev"+metric]

  sarsaCILine = plt.fill_between(sarsaQX, sarsaY+sarsaCI*1.96, \
  sarsaY-sarsaCI*1.96, color="r", alpha=0.2)
  qCILine = plt.fill_between(sarsaQX, qY+qCI*1.96, \
  qY-qCI*1.96, color="b", alpha=0.2)
  dqnCILine = plt.fill_between(dqnX, dqnY+dqnCI*1.96, \
  dqnY-dqnCI*1.96, color="g", alpha=0.2)

  sarsaLine, = plt.plot(sarsaQX, sarsaY, 'r', label="SARSA")
  qLine, = plt.plot(sarsaQX, qY, 'b', label="Q Learning")
  dqnLine, = plt.plot(dqnX, dqnY, 'g', label="Deep Q Network")

  if(metric == "Performance"):
    plt.legend(handles=[sarsaLine, qLine, dqnLine], loc=4)
    plt.ylabel('mean performance')
  else:
    plt.legend(handles=[sarsaLine, qLine, dqnLine], loc=1)
    plt.ylabel('mean score')

  plt.xlabel('epoch')
  #plt.ylim(0, 70)
  #plt.xlim(0, 2000)
  plt.title(title)
  plt.show()

if __name__ == '__main__':
  """plotMethod("/Users/Kate/B10RL8W/.logs", "contextless", "Performance", \
  'Contextless Agent Performance with Different Learning Methods')
  plotMethod("/Users/Kate/B10RL8W/.logs", "ruletracking", "Performance", \
  'Rule-Tracking Agent Performance with Different Learning Methods')
  plotMethod("/Users/Kate/B10RL8W/.logs", "guru", "Performance", \
  'Contextual Agent Performance with Different Learning Methods')"""
  
  plotMethod("/Users/Kate/B10RL8W/.logs", "contextless", "Score", \
  'Contextless Agent Score with Different Learning Methods')
  plotMethod("/Users/Kate/B10RL8W/.logs", "ruletracking", "Score", \
  'Rule-Tracking Agent Score with Different Learning Methods')
  plotMethod("/Users/Kate/B10RL8W/.logs", "guru", "Score", \
  'Contextual Agent Score with Different Learning Methods')