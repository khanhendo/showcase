"""
mapMaker module

This script allows user to generate a visualization of an 
experiment, given coordiates of nodes and network data. It 
can output a video or GIF.

This file should be imported as a module to use the following
function within mapInfo.py file for an experiment:

    * mapMaker - creates a video of experiement given network 
    data and coordiates from mapInfo.py.

Other functions include
    * main - test case: an example of what to include for a 
    mapInfo.py file for a given experiement
    * genVideo - take images and stitch together into a video
    * genGIF - take images and stitch together into a GIF
    * removeOldPics: delete given files
"""

from matplotlib.markers import MarkerStyle
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import pandas as pd
import imageio
import os
import numpy as np
import cv2


DPI = 250
FPS = 3


def removeOldPics(filenames):
    """ Deletes all files with given filenames

    Parameters
    -------
    filenames : list of strings
        files (images) to delete
    """
    for filename in set(filenames):
        os.remove(filename)


def genVideo(filenames, name="myvid"):
    """ Given still images, stitch together to create mp4 video.
    Then, calls removeOldPics() to delete still images. 

    Parameters
    -------
    filenames : list of strings
        list of filenames of images to stitch together
    name : string, optional
        the filename to give to the output file. 

    Returns
    ------
    None
    """
    # from https://theailearner.com/2018/10/15/creating-video-from-images-using-opencv-python/
    img_array = []
    for filename in filenames:
        img = cv2.imread(filename)
        height, width, layers = img.shape
        size = (width, height)
        img_array.append(img)

    out = cv2.VideoWriter(name+".mp4", cv2.VideoWriter_fourcc(*'mp4v'), FPS, size)
    for i in range(len(img_array)):
        out.write(img_array[i])
    out.release()

    removeOldPics(filenames)


def genGIF(filenames, name="mygif"):
    """ Given still images, stitch together to create gif.
    Then, calls removeOldPics() to delete still images. 

    Parameters
    -------
    filenames : list of strings
        list of filenames of images to stitch together
    name : string, optional
        the filename to give to the output file. 

    Returns
    ------
    None
    """

    with imageio.get_writer(name+'.gif', mode='I', fps=FPS) as writer:
        for filename in filenames:
            image = imageio.imread(filename)
            writer.append_data(image)
            
    removeOldPics(filenames)
    


def mapMaker(piinfo, folders, img, test=False):
    """Generates still images of each robot position. 
    Then, calls genVideo() to turn the still images into a video file.

    Parameters
    ----------
    piinfo : dict {ip: [x,   y]}
        (key) ip : int, is the IP number of the node.
        (value) : list of ints, the x and y coordinates of each stationary node. 

    folders : dict {folder_name: [[x,y], [x2, y2], ...]}
        folder_name : string, the name of each subfolder of an experiement. 
        
        [[x,y]]: list of coordanate lists, The x and y coordinates of the moving robot at each timepoint within the subfolder. 
        **Some experiments were conducted in parts. Each subfolder represents a different part of the experiment**
        **if no subfolders, folder_name should be specified 'root'.**
        
    img : string
        The name of the image file to be used as the background image. .png and .jpeg files work.

    test : bool, optional
        Default is False. 
        If False, generate all images and stich together to create a video file.
        If True, only display the first three images in a plot. Closing an image will display the next image.
        Useful for testing purposes, such as finetuning the coordinates of nodes ontop the background image.

    Returns
    -------
    None
    """

    filenames = []
    img = mpimg.imread(img)
    l = 0
    for f, stops in folders.items():
        s = 0
        if f != "root":
            f += "/"
        else:
            f = ""
        df = pd.read_csv(f + "networkProcessed.csv", index_col=0)
        print("Reading df:", f)
        grouped = df.groupby("TQ_time")

        print("Length STOP:", len(stops))
        print("Len Grouped:", len(grouped))
        
        
        for name, group in grouped:
            if s >= len(stops):
                break
            for i in group.index:
                ip = int(group["IP"][i].split(".")[3])
                if ip not in piinfo:
                    continue

                ### Choose what determies the color of the lines:
                
                ## TQ
                # if group["TQ"][i] < 200:
                #     c = "red"
                # elif group["TQ"][i] < 240:
                #     c = "yellow"
                # else:
                #     c = "green"

                # RTT
                if group["RTT"][i] == 999:
                    continue
                if group["RTT"][i] < 100:
                    c = "green"
                elif group["RTT"][i] < 250:
                    c = "yellow"
                else:
                    c = "red"

                plt.plot([piinfo[ip][0], stops[s][0]], [piinfo[ip][1], stops[s][1]], color=c)
            
            for i in piinfo.values():
                plt.plot(i[0],i[1], 'or')

            plt.plot(stops[s][0], stops[s][1], "sk", markersize=4) 
            plt.axis('equal')
            imgplot = plt.imshow(img)

            
            if test:
                plt.show()
            else:       
                # create file name and append it to a list
                filename = f'{l}.png'
                filenames.append(filename)
                
                # save frame
                plt.axis('off')
                plt.savefig(filename, bbox_inches="tight", dpi=DPI)
                plt.close()

            if test and l >= 1:
                break
            
            l += 1
            s += 1

    if test:
        pass
    else:
        # stitch images together. Can use genVideo() or genGIF()
        genVideo(filenames)




def main():
    # A test case using mapMaker. 
    # Instead, create a mapInfo.py file within each experiement folder, and call mapMaker() from there.

    pis = {
    # ip: [x,   y]
        18: [272, 300],
        21: [266, 510],
        23: [670, 510],
        24: [950, 530],
    }
    stops = [[270, i] for i in range(320, 481, 40)]
    stops += [[i, 510] for i in range(270, 1111, 40)]
    stops += [[1110, i] for i in range(510, 631, 30)]
    y = [i for i in range(670, 509, -16)]
    x = [i for i in range(1100, 699, -40)]
    stops += [[x[i], y[i]] for i, c in enumerate(x)]
    stops += [[i, 510] for i in range(700, 269, -40)]
    stops += [[270, i] for i in range(510, 319, -40)]

    img = 'RNS.png'

    mapMaker(pis, {"root":stops}, img, test=True)

if __name__ == "__main__":
    main()
