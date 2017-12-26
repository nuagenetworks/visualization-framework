#!/usr/bin/env python

import copy
from elasticsearch import Elasticsearch, helpers
import random
import time
import uuid
import yaml

CONFIG_DICT = {}
PGS = []
VPORTS = []
EVENT_TYPE = ["ACL_DENY", "TCP_SYN_FLOOD", "TCA_EVENT"]

def populatePGs():
	global PGS
	for i in range(CONFIG_DICT["no_of_pgs"]):
		PGS.append("PG" + str(i+1))

def populateVPorts():
	global PGS, VPORTS
	vport_prop = {}
	for PG in PGS:
		for i in range(CONFIG_DICT["no_of_vports_per_pgs"]):
			vport_prop['name'] = PG + "-VPort" + str(i+1)
			vport_prop['ip'] = "10.10.0." + str(i+1)
			vport_prop['mac'] = "DE:AD:BE:EF:00:" + (("0" + str(i+1)) if i<10 else str(i+1))
			vport_prop['uuid'] = str(uuid.uuid4())
			vport_prop['port'] = i+1
			vport_prop['pg'] = PG
			VPORTS.append(vport_prop)
			vport_prop = {}

def generateEventStats(domain_id):
	for i in range(len(VPORTS)):
		es_data = {}
		flow_data = random.sample(VPORTS, 2)
		# Always write it in specific index in specific doc_type
		es_data['_index'] = "nuage_event"
		es_data['_type'] = "nuage_doc_type"

		es_data['messageType'] = 2
		es_data['type'] =  random.sample(EVENT_TYPE, 1)[0]

		es_data['nuage_metadata'] ={
			'domainName': CONFIG_DICT['domain.name'] + "-" + str(domain_id),
			'enterpriseName': CONFIG_DICT['enterprise.name'],
                        'subnetName': CONFIG_DICT['domain.name'] + "-" + str(domain_id) + "-subnet",
                        'zoneName': CONFIG_DICT['domain.name'] + "-" + str(domain_id) + "-zone",
                        'vportId': flow_data[0]['uuid']
		}
		print ("Writing event information between " + flow_data[0]['name'] + " and " + flow_data[1]['name'])
		writeToES(es_data)

def writeToES(es_data):
	es = Elasticsearch()
	write_data = []
	# Create counters on the fly everytime
	# Write data for a day every minute
	# Start with 24 hours a go
	startTime = int(time.time()) * 1000 - (24 * 60 * 60 * 1000)
	for i in range(1440):
		es_data['value'] = random.randint(10000, 20000)
		es_data['timestamp'] = startTime + (i * 60000)
		write_data.append(copy.deepcopy(es_data))
		#es1.index(index="flowindex", doc_type="flow", body=es_data)
	helpers.bulk(es, iter(write_data), request_timeout=50)

def populateData():
	populatePGs()	
	populateVPorts()

def configRead():
	global CONFIG_DICT
	with open("insight.yml", "r") as fileread:
		try:
			CONFIG_DICT = yaml.load(fileread)
		except yaml.YAMLError as exc:
			print(exc)

if __name__ == "__main__":
	configRead()
        for i in range(1, CONFIG_DICT['no_of_domains']+1):
	    populateData()
	    #print PGS
	    #print VPORTS
	    generateEventStats(i)
