from flask import Flask, request
from flask_restful import Resource, Api
from flask import jsonify
from json import dumps

import numpy as np
import pandas as pd
import json
from sklearn import preprocessing
import utm
import matplotlib.pyplot as plt
from PIL import Image
import os
from flask_cors import CORS
from joblib import load

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
matrix = []
quadrants = 10

susc = ['Very Low', 'Low', 'Relatively Low', 'Moderate', 'Relatively High', 'High', 'Very High' ]

lg_max_lon = 14.565927
lg_min_lon = 13.965200
lg_max_lat = 121.677325
lg_min_lat = 120.882250

regressors = ['SVR_Linear_LSClass', 'SVR_RBF_LSClass_sub3', 'SVR_Poly']

@app.route('/')
def home():
		return "Welcome!"

def linear(data):
		xdata = []
		xdata.append(data['slope'])
		xdata.append(data['soil'])
		xdata.append(data['tri'])

		regressor = load(regressors[int(data['ker'])] + '.joblib') 
		pred = regressor.predict([xdata])

		createPlot(data['lon'], data['lat'], "red", "")

		#normalize
		suscI = int((pred + 0.5) / 0.285)

		print(pred)

		data = {'status':'success', 'susc':susc[suscI]}
		print(jsonify(data))

		return jsonify(data)

def poly(data):
		xdata = []
		xdata.append(data['slope'])
		xdata.append(data['soil'])
		xdata.append(data['fault'])
		xdata.append(data['tri'])
		xdata.append(data['rain'])

		regressor = load(regressors[int(data['ker'])] + '.joblib') 
		pred = regressor.predict([xdata])

		createPlot(data['lon'], data['lat'], "red", "")

		maxi = -0.0436
		mini = -0.018262


		#normalize
		suscI = int((pred + abs(mini)) / 0.142914)

		print(pred)

		data = {'status':'success', 'susc':susc[suscI]}
		print(jsonify(data))

		return jsonify(data)

def rbf(data):
		xdata = []
		xdata.append(data['slope'])
		xdata.append(data['soil'])
		xdata.append(data['fault'])
		xdata.append(data['tri'])

		regressor = load(regressors[int(data['ker'])] + '.joblib') 
		pred = regressor.predict([xdata])

		createPlot(data['lon'], data['lat'], "red", "")

		#normalize
		suscI = int((pred + 0.5) / 0.285)

		print(pred)

		data = {'status':'success', 'susc':susc[suscI]}
		print(jsonify(data))

		return jsonify(data)

@app.route('/regress', methods=['GET', 'POST'])
def regress():		
		data =  request.get_json(force=True)
		print(data)

		ker = int(data['ker'])

		if ker == 0:
			return linear(data)

		if ker == 1:
			return rbf(data)

		if ker == 2:
			return poly(data)


@app.route('/generate', methods=['GET', 'POST'])
def post():
		data =  request.get_json(force=True)
		print(data)
		quadrants = data['size']
		matrix = np.asarray(data['matrix'])
		print(matrix)
		print(type(matrix))
		generateMap(matrix)
		return {'status':'success'}

def getLatLonCoordsByPoint(point):
		xy = point.split('/')
		return getLatLonCoords(float(xy[0]), float(xy[1]))

def getLatLonCoords(x, y):
		return utm.to_latlon(x, y, 51, 'N')


def getLonLatSeries(point):
		tup = getLatLonCoordsByPoint(point)
		return pd.Series({"LON": tup[0], "LAT": tup[1]})


def getColor(value):
		colors ={7:"#f55656",6:"#f57656",5:"#ff6a0d",4:"#ff9e0d",3:"#b4e83a",2:"#8de31e",1:"#2f54eb"}
		return colors[value]

def getLsClass(value):
		if(value > 1.8):
			return 7
		if(value > 1.6):
			return 6
		if(value > 1.4):
			return 5
		if(value > 1.2):
			return 4
		if(value > 1):
			return 3
		if(value > 0.7):
			return 2
		if(value < 0.7):
			return 1

def getQuadrant(lon, lat):
		dist_lon = 14.565927 - 13.965200
		dist_lat = 121.677325 - 120.882250
		denom_lon = dist_lon/quadrants
		denom_lat = dist_lat/quadrants

		norm_lon = lon - lg_min_lon
		q_lon = int(norm_lon/denom_lon)
		norm_lat = lat - lg_min_lat
		q_lat = int(norm_lat/denom_lat)
		return (q_lon, q_lat)

def getWeather(lon, lat, matrix):
		quad = getQuadrant(lon, lat)
		# print( "Quadrant:" , quad)
		return matrix[quad[0]][quad[1]]

def getWeatherUsingPoint(point, matrix):
		lonlat = getLatLonCoordsByPoint(str(point))
#     print(lonlat)
#     getQuadrant(lonlat[0], lonlat[1])
		return getWeather(lonlat[0], lonlat[1], matrix)

def adjustIwi(iwi, weather):
		weight = 0.15886566639279973
		FRR = FRR = {0.2:0.1, 0.4:0.25, .6:0.5, .8:0.75, 1:0.1}
		return iwi + (FRR[(weather/5)] * weight)	

def transpy(file_src, file_dest):
		img = Image.open(file_src)
		img = img.convert("RGBA")
		datas = img.getdata()
		newData = []
		for item in datas:
				if item[0] == 255 and item[1] == 255 and item[2] == 255:
						newData.append((255, 255, 255, 0))
				else:
						newData.append(item)
		img.putdata(newData)
		os.remove(file_src)
		img.save(file_dest, "PNG")

def generateMap(matrix):
		print(matrix)
		print("Generating map..")
		applied_weather = pd.read_csv("base_classification.csv")
		applied_weather['WEATHER'] = applied_weather.apply(lambda row: getWeather(row['LON'], row['LAT'], matrix), axis = 1)
		applied_weather['ADJ_INDEX'] = applied_weather.apply(lambda row: adjustIwi(row['IW_INDEX'], row['WEATHER']), axis = 1)
		applied_weather['ADJ_LS_CLASS'] = applied_weather['ADJ_INDEX'].apply(getLsClass)
		applied_weather['ADJ_COLOR'] = applied_weather['ADJ_LS_CLASS'].apply(getColor)
		fig, ax = plt.subplots(figsize = (10,8))
		ax.scatter(applied_weather['LAT'], applied_weather['LON'], zorder=1, alpha= 0.2, c=applied_weather['ADJ_COLOR'], s=10, marker="s")
		ax.set_title('Weather Impacted Hazard Classification on Laguna Map')
		
		BBox = ((lg_min_lon,lg_max_lon,lg_min_lat,lg_max_lat))
		ax.set_xlim(BBox[2],BBox[3])
		ax.set_ylim(BBox[0],BBox[1])
		ruh_m = plt.imread('Boundary.png')
		ax.imshow(ruh_m, zorder=0, extent = BBox, aspect= 'equal')

		strFile = "D:\\CS190App\web-app\\hazard-map\\src\\images\\adjusted_class.png"
		if os.path.isfile(strFile):
	 			os.remove(strFile) 
		plt.savefig(r'D:\\CS190App\web-app\\hazard-map\\src\\images\\adjusted_class.png')
		file_dest = os.path.join('D:\\CS190App\\web-app\\hazard-map\\src\\images', 'adjusted_class.png')
		transpy('D:\\CS190App\web-app\\hazard-map\\src\\images\\adjusted_class.png', file_dest)
		print("Map Generated.")

def createPlot(longi, lati, color, plt_title):
		fig, ax = plt.subplots(figsize = (10,8))
		x = [longi]
		y = [lati]*len(x)
		s = [20*4**n for n in range(len(x))]
		ax.scatter(x, y, zorder=1, alpha= 0.2, c=color, s=10, marker="s")
		ax.set_title(plt_title)	
		BBox = ((lg_min_lon,lg_max_lon,lg_min_lat,lg_max_lat))
		ax.set_xlim(BBox[2],BBox[3])
		ax.set_ylim(BBox[0],BBox[1])
		ruh_m = plt.imread('Boundary.png')
		ax.imshow(ruh_m, zorder=0, extent = BBox, aspect= 'equal')
		plt.savefig(r'D:\\CS190App\web-app\\hazard-map\\src\\images\\point.png')
		file_dest = os.path.join('D:\\CS190App\\web-app\\hazard-map\\src\\images', 'point.png')
		transpy('D:\\CS190App\web-app\\hazard-map\\src\\images\\point.png', file_dest)
		print("Point Generated.")


if __name__ == '__main__':
		app.run(debug=True)
			