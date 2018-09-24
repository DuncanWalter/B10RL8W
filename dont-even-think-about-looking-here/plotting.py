import json
import numpy as np
import matplotlib as mpl
mpl.use('agg')
import matplotlib.pyplot as plt


def load_ch1_data():
    data_path = "dont-even-think-about-looking-here/ch1_run_data.json"
    return json.load(open(data_path))


def parse_ch1_data(data):
    return data[u'runs']


def savefile_ch1():
    return "dont-even-think-about-looking-here/ch1_run_plot.png"


if __name__ == "__main__":
    yvals = parse_ch1_data(load_ch1_data())

    yvals = np.array(yvals).T
    avg = np.average(yvals, axis=1)
    xticks = np.linspace(0, yvals.shape[0], num=8, dtype=int)
    yticks = np.linspace(0, np.round(np.max(yvals) / 100)
                         * 100, num=11, dtype=int)
    ytocks = np.round(np.logspace(1, np.log10(np.round(np.max(yvals) / 100)
                                              * 100), num=9, dtype=int) / 10) * 10
    labels = ["Run %i" % (i+1) for i in range(yvals.shape[1])]
    labels.append("Average")

    fig = plt.figure(figsize=(8, 3))
    ax1, ax2 = fig.subplots(nrows=1, ncols=2)
    ax1.plot(yvals, color="gray")
    ax1.plot(avg, color="red")
    ax1.axhline(115, color='black', linestyle=':')
    ax1.axhline(6, color='black', linestyle=':')
    ax1.legend(labels, loc="upper right")
    ax1.set_ylim(0, np.max(yvals))
    ax1.set_ylabel("Squared Error of Q")
    ax1.set_xlabel("Game Number / 20")
    ax1.set_xticks(xticks)
    ax1.set_yticks(yticks)
    ax1.set_title("Error")
    ax2.plot(yvals, color="gray")
    ax2.plot(avg, color="red")
    ax2.axhline(115, color='black', linestyle=':')
    ax2.axhline(6, color='black', linestyle=':')
    ax2.legend(labels, loc="upper right")
    ax2.set_ylabel("Squared Error of Q")
    ax2.set_xlabel("Game Number / 20")
    ax2.set_yscale("log")
    ax2.set_xticks(xticks)
    ax2.set_yticks(ytocks)
    ax2.get_yaxis().set_major_formatter(mpl.ticker.ScalarFormatter())
    ax2.set_title("Logarithm of Error")
    fig.tight_layout()
    fig.suptitle("Error of Value Function (Q) During Self-Play", y=1.05)

    print("Saving to %s" % savefile_ch1())
    fig.savefig(savefile_ch1(), dpi=300,
                pad_inches=0.1, bbox_inches="tight")
