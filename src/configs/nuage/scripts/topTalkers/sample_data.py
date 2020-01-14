#Reads from sample_data.json and injects the same data to a sample_index in localhost elasticsearch database. To use, paste the sample data in the file.

from elasticsearch import Elasticsearch
es = Elasticsearch('http://localhost:9200')
import json
import time

try:
    data = json.load(open('sample_data.json','r'))
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
pgs= ['pg1','pg2','pg3','pg4','pg5','pg6','pg7']
cats = ['cat1','cat1','cat2','cat2','cat2','cat3','cat3']

import random

for hit in hits:
    hit = hit["_source"]
    hit["nuage_metadata"]["src-pgmem-info"] = []
    hit["nuage_metadata"]["dst-pgmem-info"] = []
    srcmemcount = random.randint(0,7)
    dstmemcount = random.randint(0,7)
    srcmems = random.sample(range(7),srcmemcount)
    dstmems = random.sample(range(7),dstmemcount)
    hit["timestamp"] = int(timestamp)
    timestamp += 30*1000
    for mem in srcmems:
        obj = dict()
        obj["name"] = pgs[mem]
        obj["category"] = cats[mem]
        hit['nuage_metadata']['src-pgmem-info'].append(obj)
    for mem in dstmems:
        obj = dict()
        obj["name"] = pgs[mem]
        obj["category"] = cats[mem]
        hit['nuage_metadata']['dst-pgmem-info'].append(obj)
     
    es.index(index='nuage_flow_top',doc_type='nuage_doc_type',body=hit)

print('Finished..')
