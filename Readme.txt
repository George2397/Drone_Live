This program visualizes the drone location in real time, by gathering data collected from a local geojson file. This geojson file has just one 
feature (aka one row) that is updated every 100 ms.


==HOW TO EXECUTE==
In this folder there is a python script in "pythonLocUpdate_Script" folder. This script takes the full data set called 'aidersDatasetTestRTK.geojson' and iterates
over the rows, one by one. It takes each row and writes it to another local geojson file. Once index.html is executed, it starts reading that local geojson file every 100 ms
and updates the drone's location.
1. Execute LocUpdate.py .
2. Execute the index.html file.


Note: After some time of executing, the  LocUpdate.py script shows the following error "OSError: [Errno 22] Invalid argument: 'aiders.geojson' "