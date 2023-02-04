import sys
import os

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
sys.path.append(parent)

from mapMaker import mapMaker

def main():
  # list of coordinates for each stationary pi. 
  pis = {
    # ip: [x,   y]
      18: [272, 300],
      21: [266, 510],
      23: [670, 510],
      24: [950, 530],
  }

  # list of robot coordinates for each frame
  stops = [[270, i] for i in range(320, 481, 40)]
  stops += [[i, 510] for i in range(270, 1111, 40)]
  stops += [[1110, i] for i in range(510, 631, 30)]
  y = [i for i in range(670, 509, -16)]
  x = [i for i in range(1100, 699, -40)]
  stops += [[x[i], y[i]] for i, c in enumerate(x)]
  stops += [[i, 510] for i in range(700, 269, -40)]
  stops += [[270, i] for i in range(510, 319, -40)]

  img = 'RNS.png'

  mapMaker(pis, {"root":stops}, img)

if __name__ == "__main__":
  main()

