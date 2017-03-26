#!/usr/bin/env python

import copy
from elasticsearch import Elasticsearch, helpers
import random
import time
import yaml

CONFIG_DICT = {}
SSIDs = []
SSID_TYPE = ['public', 'private']


def populateSSIDs():
	global SSIDs
	for i in range(CONFIG_DICT["no_of_ssids"]):
		SSIDs.append({"name": "SSID-" + str(i+1), "type": random.sample(SSID_TYPE, 1)[0]})

def populateWiFiData():
	es_data = {}
	for SSID in SSIDs:
		for i in range(CONFIG_DICT["no_of_macs_per_ssids"]):
			es_data['ssid'] = SSID['name']
			es_data['mac'] = "DE:AD:BE:EF:00:" + (("0" + str(i+1)) if i<10 else str(i+1))
			es_data['ip'] = "10.10.0." + str(i+1)
			es_data['username'] = SSID['name'] + "-user-" + str(i)
			es_data['ssid_type'] = SSID['type']
			es_data['connected_time'] = random.randint(5,500)
			# Always write it in specific index in specific doc_type
			es_data['_index'] = "nuage_wifi"
			es_data['_type'] = "nuage_doc_type"
			print "Writing data for " + es_data['username']
			writeToES(es_data)


def writeToES(es_data):
	es = Elasticsearch("192.168.100.200")
	write_data = []
	# Create counters on the fly everytime
	# Write data for a day every minute
	# Start with 24 hours a go
	startTime = int(time.time()) * 1000 - (24 * 60 * 60 * 1000)
	for i in range(1440):
		es_data['timestamp'] = startTime + (i * 60000)
		es_data['rx_bytes'] = random.randint(1000, 1500)
		es_data['tx_bytes'] = random.randint(700, 1200)
		es_data['signal'] = str(random.randint(40,50)) + "dBm"
		es_data['inactive_time'] = random.randint(1,10)
		write_data.append(copy.deepcopy(es_data))
		#es1.index(index="flowindex", doc_type="flow", body=es_data)
	helpers.bulk(es, iter(write_data), request_timeout=50)

def configRead():
	global CONFIG_DICT
	with open("wifi.yml", "r") as fileread:
		try:
			CONFIG_DICT = yaml.load(fileread)
		except yaml.YAMLError as exc:
			print(exc)

if __name__ == "__main__":
	configRead()
	populateSSIDs()
	populateWiFiData()
