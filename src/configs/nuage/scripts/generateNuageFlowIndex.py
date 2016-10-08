#!/usr/bin/env python

import copy
from elasticsearch import Elasticsearch, helpers
import time
import uuid
import yaml

CONFIG_DICT = {}
PGS = []
VPORTS = []
ACL_ACTION = ["ALLOW", "DENY", "OTHER"]
PROTOCOL = ["TCP", "UDP", "ICMP"]

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

def generateFlowStats(type="l3"):
	for i in range(len(VPORTS)-1):
		es_data = {}
		# Always write it in specific index in specific doc_type
		es_data['_index'] = "nuage_flow"
		es_data['_type'] = "nuage_doc_type"

		# Filling in packet-level data
		es_data['sourceip'] = VPORTS[i]['ip']
		es_data['destinationip'] = VPORTS[i+1]['ip']
		es_data['sourcemac'] = VPORTS[i]['mac']
		es_data['destinationmac'] = VPORTS[i+1]['mac']
		es_data['sourceport'] = VPORTS[i]['port']
		es_data['destinationport'] = VPORTS[i+1]['port']

		# may change later
		es_data['protocol'] = PROTOCOL[i%3]
		es_data['tcpflag'] = 0
		es_data['messageType'] = 2
		es_data['type'] =  ACL_ACTION[i%3]
		es_data['nuage_metadata'] ={
			'inport': 1+i/5, 
			'flowid': 10000+i,
			'outport': 5-(i/4),
			'dpgName': VPORTS[i+1]['pg'],
			'enterpriseName': CONFIG_DICT['enterprise.name'], 
			'sourcevport': VPORTS[i]['uuid'],
			'destinationvport': VPORTS[i+1]['uuid'],
			'spgName': VPORTS[i]['pg'],
                        'aclId': VPORTS[i]['uuid']
		}
                if type=="l3":
                    es_data['nuage_metadata']['domainName'] = CONFIG_DICT['domain.name']
                    es_data['nuage_metadata']['subnetName'] = CONFIG_DICT['domain.name'] + "-sub"
                    es_data['nuage_metadata']['zoneName'] = CONFIG_DICT['domain.name'] + "-zone"
                else:
                    es_data['nuage_metadata']['l2domainName'] = CONFIG_DICT['domain.name'] + "-l2"

		print ("Writing flow information between " + VPORTS[i]['name'] + " and " + VPORTS[i+1]['name'])
		writeToES(es_data)

def writeToES(es_data):
	es = Elasticsearch("192.168.100.200")
	write_data = []
	# Create counters on the fly everytime
	# Write data for a day every minute
	# Start with 24 hours a go
	startTime = int(time.time()) * 1000 - (24 * 60 * 60 * 1000)
	for i in range(1440):
		es_data['bytes'] = 10000+i
		es_data['packets'] = 500+(i/500)
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
        populateData()
	generateFlowStats()
        
        
