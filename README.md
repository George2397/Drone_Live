# Drone_Live

This program visualizes the drone location in real time, by gathering data collected from a local geojson file, called "aiders.json". This geojson file has just one 
feature (aka one row) that is updated every 100 ms.


**HOW TO EXECUTE** <br/>
In this repo there is a python script "LocUpdate.py" in "pythonLocUpdate_Script" folder. This script takes the full data set called 'aidersDatasetTestRTK.geojson' and iterates
over the rows, one by one. It takes each row and writes it to another local geojson file. At the same time, while index.html is being executed, it reads that local geojson file every 100 ms and updates the drone's location.
1. Execute LocUpdate.py .
2. Execute the index.html file.


Note: After some time of executing, the  LocUpdate.py script shows the following error "OSError: [Errno 22] Invalid argument: 'aiders.geojson' "
