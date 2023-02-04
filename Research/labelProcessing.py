"""
labelProcessing 
------
This script:
1. takes the raw data from experiments, 
2. completes preprocessing steps helpful for building a model,
3. merges pre-processed data from all experiements into one dataset. 

Each row in the output dataset represents the connection from a 
robot to a stationary node.

This script was built on top of allProcessing.py script. It comes with the
added functionality of labelling the data from a given config .txt files in 
experiments. 

"""

import numpy as np
import pandas as pd
import os
import json

from sklearn.linear_model import LinearRegression

col = []

for key in range(0,360):
    col.append(str(key))

TREND_LEN = 6 

SEGMENTS = [
    ["F", col[-10:] + col[:10]], # FQ
    ["FR", col[10:45]], # FQ
    ["RFR", col[45:90]], # RQ
    ["RBR", col[90:135]], # RQ
    ["BR", col[135:180]], # BQ
    ["BL", col[180:225]], # BQ
    ["LBL", col[225:270]], # LQ
    ["LFL", col[270:315]], # LQ
    ["FL", col[315:350]] # FQ
]

# get_cat() CATEGORY DEFINITIONS:
# 0: NA, 1: approaching, 2: approaching quickly, 
# -1: leaving, -2: leaving quickly
def get_cat(num):
    if num < -1:
        return -2
    elif num < -0.5:
        return -1
    elif num > 1:
        return 2
    elif num > 0.5:
        return 1
    else:
        return 0

def neighProcessing(basepath, entry):
    """ completes these preporcessing steps on the raw dataset:
    RTT values that are: NA, 0, >999 are set to 999.
    LIDAR distance values that are: NA, 0 are set to 6. 
    trend features for TQ, RTT and LIDAR
    category values for TQ, RTT and LIDAR 
    neighQuality feature: represents the overall situation for a neighbor at a time period
    add constant config data to dataset, such as speed, location, in/outdoor information.

    Parameters
    ---------
    basepath : string
        name of experiement folder
    entry : string
        name of subfolder within experiement 

    
    Returns
    ---------
    df : pandas df. 
        processed df of given subfolder. 
    """


    # read the config file 
    with open(basepath + 'config.txt') as f:
        config = f.read()
            
    js = json.loads(config)
    lidar = False
    if "lidar" in js:
        if js["lidar"] == "on":
            lidar = True
        del js["lidar"]


    print("reading", entry+"network.csv")
    df = pd.read_csv(entry+"network.csv")
    
    df = df.rename(columns={"RRT":"RTT", "RRT_time":"RTT_time"})
    if lidar:
        lidar_file = pd.read_csv(entry + "scan.csv")
        df = pd.merge_asof(df.astype({"TQ_time":"int64"}), lidarProcessing(lidar_file), left_on="TQ_time", right_on="Time", direction="forward")
        
        df["lidarQuality"] = (df[[i[0]+'cat' for i in SEGMENTS]].sum(axis=1) / len(SEGMENTS) ) // 1
        df.loc[(len(SEGMENTS) * 6) - df[[i[0]+'cat' for i in SEGMENTS]].sum(axis=1) <= 0.001, "lidarQuality"] =  "not detected"
    else:
        df["lidarQuality"] = "Not Detected" 
        df[[i[0] for i in SEGMENTS]] = 6
        df[[i[0]+'i' for i in SEGMENTS]] = 0
        df[[i[0]+'cat' for i in SEGMENTS]] = 3
        df[[i[0]+'Trend' for i in SEGMENTS]] = 0
        df[[i[0]+'iTrend' for i in SEGMENTS]] = 0
 


    df['RTT'] = df['RTT'].fillna(999)
    df.loc[df['RTT'] == 0, 'RTT'] = 999
    df.loc[df['RTT'] > 999, 'RTT'] = 999


    # create trend values
    trendTQ = [0]
    trendRTT = [0]
    TQprev = [0]
    RTTprev = [0]

    for i in range(1, len(df)):
        if (i < 5):
            modelTQ = LinearRegression().fit(df[:][0:i].TQ_time.to_numpy().reshape((-1,1)), df[:][0:i].TQ)
            modelRTT = LinearRegression().fit(df[:][0:i].RTT_time.to_numpy().reshape((-1,1)), df[:][0:i].RTT)
        else:
            modelTQ = LinearRegression().fit(df[:][i-4:i].TQ_time.to_numpy().reshape((-1,1)), df[:][i-4:i].TQ)
            modelRTT = LinearRegression().fit(df[:][i-4:i].RTT_time.to_numpy().reshape((-1,1)), df[:][i-4:i].RTT)
        
        trendTQ.append(modelTQ.coef_[0])
        trendRTT.append(modelRTT.coef_[0])   
        TQprev.append(df["TQ"][i-1])
        RTTprev.append(df["RTT"][i-1])

    df['TQtrend'] = trendTQ
    df['RTTtrend'] = trendRTT
    df["TQprev"] = TQprev
    df['RTTprev'] = RTTprev

    # classify values into categories    
    for key, val in js.items():
        df[key] = val

    bins = [0, 100, 150, 200, 240, np.inf]
    names = [4, 3, 2, 1, 0]
    df['TQcat'] = pd.cut(df["TQ"], bins, labels=names).astype(int)

    bins = [0, 50, 100, 250, np.inf]
    names = [0, 1, 2, 3]
    df['RTTcat'] = pd.cut(df["RTT"], bins, labels=names).astype(int)


    # overall quality categorical value 
    # for a given neighboring node at a given time
    df["neighQuality"] = df['TQcat'] + df["RTTcat"]


    return df



def lidarProcessing(lidar):
    """Pre-process lidar data 
    LIDAR distance values that are: NA, 0 are set to 6. 
    Group the many rays into segments
    creats LIDAR trend values, describing change over time
    creates LIDAR category values, classifying numerical values into categories


    Parameters
    -------
    lidar : pandas dataframe
        containing the lidar data of a given subfolder
    
    Returns
    -------
    df : pandas dataframe
        pre-processed data
    
    """
    df = pd.DataFrame()

    df["Time"] = lidar["Time"]

    # basic check to see all 360 rays used
    rays_used = 0
    for seg in SEGMENTS:
        rays_used += len(seg[1])
    if rays_used != 360:
        print("Warning, incorrect number of rays detected. Please double check SEGMENTS. \n Detected:", rays_used, "rays\n")

    # Combine multiple rays into one segment
    for seg in SEGMENTS:
        col_name = seg[0]
        distList = [] 
        for i in seg[1]:
            # Adjust the lidar value for not detected
            lidar.loc[(lidar["Dist" + i] == 0) & (lidar["Int" + i] < 5000), "Dist" + i] = 6
            distList.append("Dist" + i)
        df[col_name] = lidar[distList].mean(axis=1)
        df[col_name + "i"] = lidar[("Int" + i for i in seg[1])].mean(axis=1)
        
        bins = [0, 0.5, 2, 5.9, np.inf]
        names = [0, 1, 2, 3]
        df[col_name + 'cat'] = pd.cut(df[col_name], bins, labels=names)


    for seg in SEGMENTS:
        # for distance values
        col_name = seg[0] 
        trend = [0]
        trend_cat = [0]
        TQ_cat = [0]

        i = 1
        while i < TREND_LEN:
            if len(df) > i: # just in case dataframe smaller than TREND_LEN
                model = LinearRegression().fit(df[:][0:i].Time.to_numpy().reshape((-1,1)), df[:][0:i][col_name])
                trend.append(model.coef_[0])
                trend_cat.append(get_cat(model.coef_[0]))
            i += 1
        for i in range(TREND_LEN, len(df)):
                model = LinearRegression().fit(df[:][i-TREND_LEN+1:i].Time.to_numpy().reshape((-1,1)), df[:][i-TREND_LEN+1:i][col_name])
                trend.append(model.coef_[0]) 
                trend_cat.append(get_cat(model.coef_[0]))  
    
        df[col_name + "Trend"] = trend
        # df[col_name + "TrendCat"] = trend_cat


        # for intensity values
        col_name = seg[0] + "i"
        trend = []

        trend.append(0)

        i = 1
        while i < TREND_LEN:
            if len(df) > i: # just in case dataframe smaller than TREND_LEN
                model = LinearRegression().fit(df[:][0:i].Time.to_numpy().reshape((-1,1)), df[:][0:i][col_name])
                trend.append(model.coef_[0])

            i += 1
        for i in range(TREND_LEN, len(df)):
                model = LinearRegression().fit(df[:][i-TREND_LEN+1:i].Time.to_numpy().reshape((-1,1)), df[:][i-TREND_LEN+1:i][col_name])
                trend.append(model.coef_[0]) 
    
        df[col_name + "Trend"] = trend
    return df

def main():
    dirs = {
        "RNS #1": False,
        "RNS #2": False,
        "Soccer Field raw": True,
        "Thorson1": True
    }
    df = pd.DataFrame()

    for basepath, val in dirs.items():
        if val:
            basepath += '/'
            with os.scandir(basepath) as entries:
                for entry in entries:
                    if entry.is_dir():
                        print(basepath + entry.name + "/*.csv")
                        df = pd.concat([df, neighProcessing(basepath, basepath + entry.name + "/")], ignore_index=True)
        else:    
            df = pd.concat([df, neighProcessing(basepath + "/", basepath + "/")], ignore_index=True)
    
    df.to_csv("neighborQ.csv")

if __name__ == "__main__":
    main()