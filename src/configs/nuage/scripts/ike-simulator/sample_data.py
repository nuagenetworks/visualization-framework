#Reads from sample_data.json and injects the same data to a sample_index in localhost elasticsearch database. To use, paste the sample data in the file.

from elasticsearch import Elasticsearch
es = Elasticsearch('http://localhost:9200')
import json
import time

try:
    data = json.load(open('sample_data_ike.json','r'))
except:
    print('Error reading sample_data.json. Exiting.')
    exit(0)

try:
    hits = data['hits']['hits']
except:
    print('Hits not present in data. Check data. Exiting.')
    exit(0)

print('Number of hits read = %d'%(len(hits)))
print("Indexing...")

timestamp = (time.time() - 10*60*60)*1000

TunnelName = [ "Tunnel-1", "Tunnel-2", "Tunnel-3"]


import random

for hit in hits:
    hit = hit["_source"]
    hit["timestamp"] = int(timestamp)
    hit["TunnelName"] = random.choice(TunnelName)
    hit["ProbeName"] = "Probe"
    hit["TunnelState"] = "true"
    hit["Bytes"] = random.randint(500,2000)
    hit["Packets"] = random.randint(100,500)
    hit["Tx"] = random.randint(1,10)
    hit["Rx"] = random.randint(1,10)
    hit["Tier1State"] = random.choice(["UP", "DOWN", "NOT_PROBED"])
    hit["Tier2State"] = random.choice(["UP", "DOWN", "NOT_PROBED"])
    hit["RoundRobinState"] = random.randint(1,10)
    hit["MultipleStatesChanged"] = "false"
    hit["Tier1URLInfo"] = { "UrlString": "www.tier1.com", "UrlState": hit["Tier1State"] }
    hit["Tier2URLInfo"] = { "UrlString": "www.tier2.com", "UrlState": hit["Tier2State"] }
    if hit["Tier1State"] == "DOWN": 
        hit["ProbeFailureReason"] = "Unable to reach"
        hit["Tier1URLInfo"]["UrlFailureReason "] = "Unable to reach"
    if hit["Tier2State"] == "DOWN": 
        hit["Tier2URLInfo"]["UrlFailureReason "] = "Unable to reach"
    timestamp += 30*1000 
     
    es.index(index='nuage_ike_probestats',doc_type='nuage_doc_type',body=hit)

print('Finished "nuage_ike_probestats"..')

for hit in hits:
    hit = hit["_source"]
    hit["timestamp"] = int(timestamp)
    hit["TunnelName"] = random.choice(TunnelName)
    hit["ProbeState"] = "true"
    hit["ProbeStatus"] = random.choice(["GRAY", "GREEN"])
    hit["Tier1State"] = random.randint(1,10)
    hit["Tier2State"] = random.randint(1,10)
    timestamp += 30*1000
     
    es.index(index='nuage_ike_probe_status',doc_type='nuage_doc_type',body=hit)

print('Finished "nuage_ike_probe_status"...')

for hit in hits:
    hit = hit["_source"]
    hit["timestamp"] = int(timestamp)
    hit["TunnelName"] = random.choice(TunnelName) 
    hit["TunnelState"] = "true"
    hit["Destination"] = "ovs-1"
    hit["Bytes"] = random.randint(500,2000)
    hit["Packets"] = random.randint(100,500)
    hit["Tx"] = random.randint(1,10)
    hit["Rx"] = random.randint(1,10)
    hit["TxPacketsCount"] = hit["Tx"]*hit["Packets"]
    hit["TxBytesCount"] = hit["Tx"]*hit["Bytes"]
    hit["RxPacketsCount"] = hit["Rx"]*hit["Packets"]
    hit["RxBytesCount"] = hit["Rx"]*hit["Bytes"]
    timestamp += 30*1000
     
    es.index(index='nuage_ike_stats',doc_type='nuage_doc_type',body=hit)

print('Finished "nuage_ike_stats"..')