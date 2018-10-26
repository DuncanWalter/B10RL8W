import matplotlib.pyplot as plt

def main():
  x = [0,2,3,4]
  y = [1,4,9,16]
  learningLine, = plt.plot(x, y, 'r--', label="Learning Agent")
  randomLine, = plt.plot(x, [i * 2 for i in y], 'b--', label="Random Agent")
  heuristicLine, = plt.plot(x, [i * 4 for i in y], 'g--', label="Heuristic Agent")
  plt.legend(handles=[learningLine, randomLine, heuristicLine])
  plt.xlabel('epoch')
  plt.ylabel('y label')
  plt.ylim(0, 70)
  plt.xlim(0, 4)
  plt.title('title')
  plt.show()

if __name__ == '__main__':
  main()