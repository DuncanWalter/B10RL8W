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

def plotMethod(directory, method):
  contextlessFrame = averageRuns(directory, method+"_contextless")
  ruleFrame = averageRuns(directory, method+"_ruletracking")
  guruFrame = averageRuns(directory, method+"_guru")

  x = range(0, 2001, 100)
  contextlessY = contextlessFrame["meanPerformance"]
  ruleY = ruleFrame["meanPerformance"]
  guruY = guruFrame["meanPerformance"]

  contextlessLine, = plt.plot(x, contextlessY, 'r--', label="Contextless")
  ruleLine, = plt.plot(x, ruleY, 'b--', label="Rule")
  guruLine, = plt.plot(x, guruY, 'g--', label="Guru")
  plt.legend(handles=[contextlessLine, ruleLine, guruLine])
  plt.xlabel('epoch')
  plt.ylabel('mean performance')
  #plt.ylim(0, 70)
  plt.xlim(0, 2000)
  plt.title('Agent Performance with SARSA')
  plt.show()

if __name__ == '__main__':
  #averageRuns("/Users/Kate/B10RL8W/.logs", "sarsa_contextless")
  plotMethod("/Users/Kate/B10RL8W/.logs", "sarsa")