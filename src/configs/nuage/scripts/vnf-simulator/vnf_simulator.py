#!/usr/bin/env python

import copy
from elasticsearch import Elasticsearch, helpers
import random
import time
import yaml

CONFIG_DICT = {}
NSGs = []


def populateNSGs():
	global NSGs
	for i in range(CONFIG_DICT["no_of_nsgs"]):
		NSGs.append("NSG-" + str(i+1))


def populateVNFData():
	es_data = {}
	for NSG in NSGs:
		for i in range(CONFIG_DICT["no_of_vnf_per_nsgs"]):
			es_data['nsg'] = NSG
			es_data['vnf'] = NSG + "-VNF-" + str(i+1)
 			# Always write it in specific index in specific doc_type
			es_data['_index'] = "nuage_vnf"
			es_data['_type'] = "nuage_doc_type"
			print "Writing data for " + es_data['nsg']
			writeToES(es_data)


def writeToES(es_data):
	es = Elasticsearch("http://localhost:9200")
	write_data = []
	# Create counters on the fly everytime
	# Write data for a day every minute
	# Start with 24 hours a go
	startTime = int(time.time()) * 1000 - (24 * 60 * 60 * 1000)
	for i in range(1440):
		es_data['enterpriseName'] = 'enterprise-1';
		es_data['timestamp'] = startTime + (i * 300000)
		es_data['cpu'] = random.randint(0, 100)
		es_data['memory'] = random.randint(0, 100)
		es_data['disk'] = random.randint(0,100)
		write_data.append(copy.deepcopy(es_data))
	helpers.bulk(es, iter(write_data), request_timeout=50)


def configRead():
	global CONFIG_DICT
	with open("vnf.yml", "r") as fileread:
		try:
			CONFIG_DICT = yaml.load(fileread)
		except yaml.YAMLError as exc:
			print(exc)


if __name__ == "__main__":
	configRead()
	populateNSGs()
	populateVNFData()
