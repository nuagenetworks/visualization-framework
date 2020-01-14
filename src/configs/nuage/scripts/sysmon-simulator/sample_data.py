#Reads from sample_data.json and injects the same data to a sample_index in localhost elasticsearch database. To use, paste the sample data in the file.

from elasticsearch import Elasticsearch
es = Elasticsearch('http://localhost:9200')
import json
import time

try:
    data = json.load(open('sample_data_sysmon.json','r'))
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


import random

for hit in hits:
    hit = hit["_source"]
    hit["timestamp"] = int(timestamp)
    timestamp += 30*1000
    hit["CPU"] = random.randint(1,100)
    hit["MEMORY"] = random.randint(1,100)
    hit["used"] = random.randint(100, 1000)
    hit["available"] = random.randint(100,1000)
    hit["total"] = hit["used"] +  hit["available"]
    hit["disks"] = [{"name" : '/home', "used": random.randint(100, 1000), "available" : random.randint(100,1000)}]
     
    es.index(index='nuage_sysmon',doc_type='nuage_doc_type',body=hit)

print('Finished..')
